import React, { useState, useEffect, useRef } from 'react';
import {
  Truck, Plus, Package, CheckCircle, Navigation, MapPin,
  Eye, X, ChevronDown, ChevronUp, FileText,
  AlertTriangle, CreditCard
} from 'lucide-react';
import './ConvoyDashboardPage.css';

/* ================================================================
   ConvoyDashboardPage
   ================================================================ */
const ConvoyDashboardPage = ({ convoyId }) => {
  // ── Core data ────────────────────────────────────────────────
  const [jobs, setJobs]               = useState([]);
  const [activeJob, setActiveJob]     = useState(null);
  const [units, setUnits]             = useState([]);
  const [globalProducts, setGlobalProducts] = useState([]);

  // ── Form state ───────────────────────────────────────────────
  const [selectedUnit, setSelectedUnit]     = useState('');
  const [deliveryItems, setDeliveryItems]   = useState([{ productId: '', quantity: 1 }]);

  // ── UI state ─────────────────────────────────────────────────
  const [expandedDelivery, setExpandedDelivery]   = useState(null);
  const [viewBillDelivery, setViewBillDelivery]   = useState(null); // delivery obj | null
  const [confirmAction, setConfirmAction]         = useState(null); // { type, unitId, message }
  const [stockCount, setStockCount]               = useState(0);
  const stockCountRef = useRef(0);

  // ── Mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (convoyId) {
      fetchJobs();
      fetchUnits();
      fetchGlobalProducts();
    }
  }, [convoyId]);

  // Animated counter for total stock
  useEffect(() => {
    if (!activeJob) return;
    const target = activeJob.totalStock || 0;
    if (stockCountRef.current === target) return;
    const step = Math.ceil(Math.abs(target - stockCountRef.current) / 20);
    const interval = setInterval(() => {
      stockCountRef.current = Math.min(stockCountRef.current + step, target);
      setStockCount(stockCountRef.current);
      if (stockCountRef.current >= target) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [activeJob?.totalStock]);

  // ── API helpers ──────────────────────────────────────────────
  const fetchJobs = async () => {
    try {
      const res  = await fetch((import.meta.env.VITE_API_URL || '') + `/api/convoys/${convoyId}/jobs`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        const current = data.jobs.find(j => j.status === 'Started');
        setActiveJob(current || null);
        if (current) {
          stockCountRef.current = 0;
          setStockCount(0);
        }
      }
    } catch (err) { console.error('fetchJobs:', err); }
  };

  const fetchUnits = async () => {
    try {
      const res  = await fetch((import.meta.env.VITE_API_URL || '') + '/api/units');
      const data = await res.json();
      if (data.success) setUnits(data.units);
    } catch (err) { console.error('fetchUnits:', err); }
  };

  const fetchGlobalProducts = async () => {
    try {
      const res  = await fetch((import.meta.env.VITE_API_URL || '') + '/api/warehouses/products');
      const data = await res.json();
      if (data.success) setGlobalProducts(data.products);
    } catch (err) { console.error('fetchGlobalProducts:', err); }
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handleStartJob = async () => {
    try {
      const res  = await fetch((import.meta.env.VITE_API_URL || '') + `/api/convoys/${convoyId}/jobs`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fetchJobs();
    } catch (err) { console.error('handleStartJob:', err); }
  };

  const handleAddDelivery = async () => {
    if (!selectedUnit || deliveryItems.length === 0) return;
    const itemsToAdd = deliveryItems
      .filter(item => item.productId && item.quantity > 0)
      .map(item => {
        const product = globalProducts.find(p => p.productId === item.productId);
        return {
          productId: product.productId,
          name:      product.name,
          price:     product.price,
          quantity:  Number(item.quantity),
        };
      });
    if (itemsToAdd.length === 0) return;
    const unitDetails = units.find(u => u.unitId === selectedUnit);
    try {
      const res  = await fetch(
        `/api/convoys/${convoyId}/jobs/${activeJob.jobId}/deliveries`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ unitId: selectedUnit, unitName: unitDetails.name, items: itemsToAdd }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.job);
        setSelectedUnit('');
        setDeliveryItems([{ productId: '', quantity: 1 }]);
      }
    } catch (err) { console.error('handleAddDelivery:', err); }
  };

  const confirmDeliver = (unitId) => {
    setConfirmAction({
      type:    'deliver',
      unitId,
      message: 'Confirm drop-off items to this unit? A bill will be generated.',
    });
  };

  const confirmPay = (unitId) => {
    setConfirmAction({
      type:    'pay',
      unitId,
      message: 'Confirm payment received from this unit?',
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, unitId } = confirmAction;
    setConfirmAction(null);
    if (type === 'deliver') {
      try {
        const res  = await fetch(
          `/api/convoys/${convoyId}/jobs/${activeJob.jobId}/deliveries/${unitId}/deliver`,
          { method: 'PUT' },
        );
        const data = await res.json();
        if (data.success) fetchJobs();
      } catch (err) { console.error('markDelivered:', err); }
    } else if (type === 'pay') {
      try {
        const res  = await fetch(
          `/api/convoys/${convoyId}/jobs/${activeJob.jobId}/deliveries/${unitId}/pay`,
          { method: 'PUT' },
        );
        const data = await res.json();
        if (data.success) fetchJobs();
      } catch (err) { console.error('markPayment:', err); }
    }
  };

  const toggleExpanded = (unitId) => {
    setExpandedDelivery(prev => (prev === unitId ? null : unitId));
  };

  // ── Sub-components ───────────────────────────────────────────

  /* Empty state */
  const EmptyState = () => (
    <div className="cj-empty-state">
      <div className="cj-truck-wrapper">
        <Truck size={56} className="cj-truck-icon" />
      </div>
      <h3 className="cj-empty-title">No Active Job</h3>
      <p className="cj-empty-desc">
        Start a new job to plan deliveries and track vehicle stock.
      </p>
      <button
        className="cj-start-btn"
        onClick={handleStartJob}
      >
        <Navigation size={18} />
        Start New Job
      </button>
    </div>
  );

  /* Delivery route card */
  const DeliveryCard = ({ delivery }) => {
    const isPending   = delivery.status === 'Pending';
    const isDelivered = delivery.status === 'Delivered';
    const isPaid      = delivery.paymentCompleted;
    const isExpanded  = expandedDelivery === delivery.unitId;

    return (
      <div className="cj-route-card">
        {/* Header */}
        <div className="cj-route-card-header">
          <div className="cj-route-card-left">
            <div className="cj-unit-icon-wrap">
              <MapPin size={18} />
            </div>
            <div>
              <span className="cj-unit-name">{delivery.unitName}</span>
              <div className="cj-badge-row">
                {isPending ? (
                  <span className="biowin-badge-pending">⏳ Pending</span>
                ) : (
                  <span className="biowin-badge-delivered">✓ Delivered</span>
                )}
                {isPaid && <span className="biowin-badge-paid">💳 Paid</span>}
              </div>
            </div>
          </div>
          <div className="cj-route-card-right">
            <span className="cj-total-chip">
              <span style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>₹</span>
              {delivery.totalAmount?.toFixed(2)}
            </span>
            <button
              className="icon-button"
              onClick={() => toggleExpanded(delivery.unitId)}
              title={isExpanded ? 'Collapse items' : 'Expand items'}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Collapsible items table */}
        {isExpanded && (
          <div className="cj-items-table-wrap">
            <table className="cj-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {delivery.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.name}</td>
                    <td>{it.quantity}</td>
                    <td>₹{Number(it.price).toFixed(2)}</td>
                    <td className="cj-subtotal">₹{(it.quantity * it.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="cj-total-row">
                  <td colSpan="3">Total Bill</td>
                  <td className="cj-subtotal">₹{delivery.totalAmount?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="cj-route-card-actions">
          <button
            className="cj-view-bill-btn"
            onClick={() => setViewBillDelivery(delivery)}
          >
            <Eye size={15} /> View Bill
          </button>

          {isPending && (
            <button
              className="biowin-btn-success"
              style={{ fontSize: '0.84rem', padding: '0.45rem 1rem' }}
              onClick={() => confirmDeliver(delivery.unitId)}
            >
              <CheckCircle size={15} /> Mark Delivered &amp; Generate Bill
            </button>
          )}

          {isDelivered && !isPaid && (
            <button
              className="cj-pay-btn"
              onClick={() => confirmPay(delivery.unitId)}
            >
              <CreditCard size={15} /> Confirm Payment Received
            </button>
          )}
        </div>
      </div>
    );
  };

  /* Inline confirmation banner */
  const ConfirmBanner = () => {
    if (!confirmAction) return null;
    return (
      <div className="cj-confirm-banner">
        <AlertTriangle size={18} className="cj-confirm-icon" />
        <span className="cj-confirm-msg">{confirmAction.message}</span>
        <div className="cj-confirm-actions">
          <button className="cj-confirm-yes" onClick={executeConfirmAction}>
            Yes, Confirm
          </button>
          <button className="cj-confirm-no" onClick={() => setConfirmAction(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  /* Bill Modal */
  const BillModal = ({ delivery }) => {
    if (!delivery) return null;
    return (
      <div className="biowin-modal-overlay" onClick={() => setViewBillDelivery(null)}>
        <div className="cj-bill-modal" onClick={e => e.stopPropagation()}>
          {/* Bill Header */}
          <div className="cj-bill-header">
            <div className="cj-bill-logo">
              <Truck size={22} />
              <span>Biowin Agro Research</span>
            </div>
            <h2 className="cj-bill-title">Delivery Bill</h2>
            <button
              className="cj-bill-close"
              onClick={() => setViewBillDelivery(null)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="cj-bill-body">
            {/* Bill meta */}
            <div className="cj-bill-meta">
              <div className="cj-bill-meta-row">
                <span className="cj-bill-label">Job ID</span>
                <span className="cj-bill-value">#{activeJob?.jobId}</span>
              </div>
              <div className="cj-bill-meta-row">
                <span className="cj-bill-label">Convoy ID</span>
                <span className="cj-bill-value">{convoyId}</span>
              </div>
              <div className="cj-bill-meta-row">
                <span className="cj-bill-label">Unit Name</span>
                <span className="cj-bill-value">{delivery.unitName}</span>
              </div>
              <div className="cj-bill-meta-row">
                <span className="cj-bill-label">Date</span>
                <span className="cj-bill-value">
                  {delivery.deliveredAt
                    ? new Date(delivery.deliveredAt).toLocaleString()
                    : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="cj-bill-meta-row">
                <span className="cj-bill-label">Payment Status</span>
                <span>
                  {delivery.paymentCompleted
                    ? <span className="biowin-badge-paid">Paid</span>
                    : <span className="biowin-badge-pending">Pending</span>}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div className="cj-bill-items">
              <table className="cj-bill-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {delivery.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.name}</td>
                      <td>{it.quantity}</td>
                      <td>₹{Number(it.price).toFixed(2)}</td>
                      <td>₹{(it.quantity * it.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand total */}
            <div className="cj-bill-total">
              <span className="cj-bill-total-label">Grand Total</span>
              <span className="cj-bill-total-value">
                ₹{delivery.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="cj-bill-footer">
            <button
              className="biowin-btn-secondary"
              onClick={() => setViewBillDelivery(null)}
            >
              <X size={15} /> Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="convoy-dashboard">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Convoy Jobs</h1>
          <p className="page-subtitle">Manage routes, deliveries, and billing</p>
        </div>
      </div>

      {/* ── No active job ────────────────────────────────────── */}
      {!activeJob ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Active job header ───────────────────────────── */}
          <div className="cj-job-header">
            <div className="cj-job-header-info">
              <FileText size={20} className="cj-job-header-icon" />
              <div>
                <p className="cj-job-header-label">Active Job</p>
                <h3 className="cj-job-header-id">#{activeJob.jobId}</h3>
              </div>
            </div>
            <div className="cj-stock-pill">
              <Package size={16} />
              <span>Total Vehicle Stock</span>
              <strong>{stockCount}</strong>
              <span>units</span>
            </div>
          </div>

          {/* ── Inline confirm banner ───────────────────────── */}
          <ConfirmBanner />

          {/* ── Add unit to route form ──────────────────────── */}
          <div className="card cj-add-route-form">
            <div className="card-header">
              <h4 className="card-title">
                <Plus size={17} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Add Unit to Route
              </h4>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Select Unit Destination</label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={16}
                    style={{
                      position:  'absolute',
                      left:      '12px',
                      top:       '50%',
                      transform: 'translateY(-50%)',
                      color:     '#2ecc71',
                      pointerEvents: 'none',
                    }}
                  />
                  <select
                    value={selectedUnit}
                    onChange={e => setSelectedUnit(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  >
                    <option value="">— Select Unit —</option>
                    {units.map(u => (
                      <option key={u.unitId} value={u.unitId}>
                        {u.name} ({u.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label className="form-group" style={{ marginBottom: '0.75rem' }}>
                <Package size={15} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Items to Deliver
              </label>
            </div>

            {deliveryItems.map((item, index) => (
              <div className="cj-item-row" key={index}>
                <div className="form-group flex-1">
                  <select
                    value={item.productId}
                    onChange={e => {
                      const newItems = [...deliveryItems];
                      newItems[index].productId = e.target.value;
                      setDeliveryItems(newItems);
                    }}
                  >
                    <option value="">— Select Product —</option>
                    {globalProducts.map(p => (
                      <option key={p.productId} value={p.productId}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group cj-qty-group">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => {
                      const newItems = [...deliveryItems];
                      newItems[index].quantity = e.target.value;
                      setDeliveryItems(newItems);
                    }}
                    placeholder="Qty"
                  />
                </div>
                {deliveryItems.length > 1 && (
                  <button
                    type="button"
                    className="icon-button cj-remove-btn"
                    onClick={() => setDeliveryItems(deliveryItems.filter((_, i) => i !== index))}
                    title="Remove item"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <button
              className="cj-add-item-btn"
              onClick={() => setDeliveryItems([...deliveryItems, { productId: '', quantity: 1 }])}
            >
              <Plus size={14} /> Add Another Item
            </button>

            <div style={{ marginTop: '1.25rem' }}>
              <button className="biowin-btn-primary" onClick={handleAddDelivery}>
                <MapPin size={16} /> Save to Route
              </button>
            </div>
          </div>

          {/* ── Delivery route list ─────────────────────────── */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              Delivery Route
            </h4>
            {activeJob.deliveries && activeJob.deliveries.length > 0 ? (
              activeJob.deliveries.map(delivery => (
                <DeliveryCard key={delivery.unitId} delivery={delivery} />
              ))
            ) : (
              <div style={{ color: '#64748b', padding: '1.5rem', textAlign: 'center' }}>
                No deliveries planned yet.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Job history ──────────────────────────────────────── */}
      {jobs.filter(j => j.status === 'Completed').length > 0 && (
        <div className="card cj-history-section" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h4 className="card-title">Job History</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="biowin-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Status</th>
                  <th>Total Stock Delivered</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.filter(j => j.status === 'Completed').map(job => (
                  <tr key={job.jobId}>
                    <td style={{ fontWeight: 600 }}>#{job.jobId}</td>
                    <td><span className="biowin-badge-delivered">{job.status}</span></td>
                    <td>{job.totalStock} units</td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bill Modal ───────────────────────────────────────── */}
      <BillModal delivery={viewBillDelivery} />
    </div>
  );
};

export default ConvoyDashboardPage;
