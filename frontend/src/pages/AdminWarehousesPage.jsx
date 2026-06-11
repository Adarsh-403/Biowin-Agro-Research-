import React, { useState, useEffect } from 'react';
import { Search, Plus, Warehouse, X, Edit, Trash2 } from 'lucide-react';
import './AdminWarehousesPage.css';

const AdminWarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', region: '', address: '', password: '', status: 'Active' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      const data = await response.json();
      if (data.success) {
        setWarehouses(data.warehouses);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWarehouse)
      });
      const data = await response.json();
      if (data.success) {
        setWarehouses([...warehouses, data.warehouse]);
        setIsModalOpen(false);
        setNewWarehouse({ name: '', region: '', address: '', password: '', status: 'Active' });
      } else {
        alert(data.message || 'Error creating warehouse');
      }
    } catch (error) {
      console.error('Error creating warehouse:', error);
      alert('Failed to connect to server');
    }
  };

  const handleEditWarehouse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/warehouses/${editingWarehouse.warehouseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingWarehouse)
      });
      const data = await response.json();
      if (data.success) {
        setWarehouses(warehouses.map(w => w.warehouseId === editingWarehouse.warehouseId ? { ...w, ...editingWarehouse } : w));
        setEditingWarehouse(null);
      } else {
        alert(data.message || 'Error updating warehouse');
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      alert('Failed to connect to server');
    }
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      const response = await fetch(`/api/warehouses/${warehouseId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setWarehouses(warehouses.filter(w => w.warehouseId !== warehouseId));
      } else {
        alert(data.message || 'Error deleting warehouse');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="admin-warehouses-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse Management</h1>
          <p className="page-subtitle">Manage storage facilities and inventory centers.</p>
        </div>
        <div className="header-actions">
          <button className="action-button primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add New Warehouse
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Warehouses</h3>
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search warehouses..." className="search-input" />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="warehouse-table">
            <thead>
              <tr>
                <th>WAREHOUSE ID</th>
                <th>WAREHOUSE NAME</th>
                <th>REGION</th>
                <th>CAPACITY</th>
                <th>UTILIZATION</th>
                <th>STATUS</th>
                <th style={{textAlign: 'center'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading warehouses...</td></tr>
              ) : warehouses.map((warehouse) => (
                <tr key={warehouse._id || warehouse.warehouseId}>
                  <td><span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-700">#{warehouse.warehouseId}</span></td>
                  <td>
                    <div className="warehouse-name-cell">
                      <div className="warehouse-icon-wrapper">
                        <Warehouse size={16} />
                      </div>
                      <span className="warehouse-name-text">{warehouse.name}</span>
                    </div>
                  </td>
                  <td>{warehouse.region}</td>
                  <td>{warehouse.capacity || 0} units</td>
                  <td>{warehouse.utilization || 0}%</td>
                  <td>
                    <span className={`status-badge ${(warehouse.status || 'Active').toLowerCase()}`}>
                      {warehouse.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => setEditingWarehouse(warehouse)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteWarehouse(warehouse.warehouseId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Warehouse</h2>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddWarehouse} className="add-warehouse-form">
              <div className="form-group">
                <label>Warehouse Name</label>
                <input 
                  type="text" 
                  value={newWarehouse.name} 
                  onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                  placeholder="e.g. Central Hub"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={newWarehouse.region} 
                  onChange={(e) => setNewWarehouse({...newWarehouse, region: e.target.value})}
                  placeholder="e.g. North Region"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  value={newWarehouse.address} 
                  onChange={(e) => setNewWarehouse({...newWarehouse, address: e.target.value})}
                  placeholder="e.g. 456 Storage Rd"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={newWarehouse.password} 
                  onChange={(e) => setNewWarehouse({...newWarehouse, password: e.target.value})}
                  placeholder="Warehouse account password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  value={newWarehouse.status || 'Active'} 
                  onChange={(e) => setNewWarehouse({...newWarehouse, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="action-button secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary">
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Warehouse Modal */}
      {editingWarehouse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Warehouse</h2>
              <button className="icon-button" onClick={() => setEditingWarehouse(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditWarehouse} className="add-warehouse-form">
              <div className="form-group">
                <label>Warehouse Name</label>
                <input 
                  type="text" 
                  value={editingWarehouse.name} 
                  onChange={(e) => setEditingWarehouse({...editingWarehouse, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={editingWarehouse.region} 
                  onChange={(e) => setEditingWarehouse({...editingWarehouse, region: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input 
                  type="number" 
                  value={editingWarehouse.capacity || 0} 
                  onChange={(e) => setEditingWarehouse({...editingWarehouse, capacity: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Utilization (%)</label>
                <input 
                  type="number" 
                  value={editingWarehouse.utilization || 0} 
                  onChange={(e) => setEditingWarehouse({...editingWarehouse, utilization: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editingWarehouse.status || 'Active'} 
                  onChange={(e) => setEditingWarehouse({...editingWarehouse, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="action-button secondary" onClick={() => setEditingWarehouse(null)}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWarehousesPage;
