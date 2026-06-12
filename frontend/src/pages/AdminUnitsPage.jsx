import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, X, Edit, Trash2 } from 'lucide-react';
import './AdminUnitsPage.css';

const AdminUnitsPage = () => {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({ name: '', region: '', address: '', password: '', status: 'Active' });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/units');
      const data = await response.json();
      if (data.success) {
        setUnits(data.units);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit)
      });
      const data = await response.json();
      if (data.success) {
        setUnits([...units, data.unit]);
        setIsModalOpen(false);
        setNewUnit({ name: '', region: '', address: '', password: '', status: 'Active' });
      } else {
        alert(data.message || 'Error creating unit');
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      alert('Failed to connect to server');
    }
  };

  const handleEditUnit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/units/${editingUnit.unitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUnit)
      });
      const data = await response.json();
      if (data.success) {
        setUnits(units.map(u => u.unitId === editingUnit.unitId ? { ...u, ...editingUnit } : u));
        setEditingUnit(null);
      } else {
        alert(data.message || 'Error updating unit');
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Failed to connect to server');
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/units/${unitId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setUnits(units.filter(u => u.unitId !== unitId));
      } else {
        alert(data.message || 'Error deleting unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="admin-units-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Unit Management</h1>
          <p className="page-subtitle">Manage organizational units and operational outlets.</p>
        </div>
        <div className="header-actions">
          <button className="action-button primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add New Unit
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Units</h3>
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search units..." className="search-input" />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="unit-table">
            <thead>
              <tr>
                <th>UNIT ID</th>
                <th>UNIT NAME</th>
                <th>REGION</th>
                <th>TOTAL SALES</th>
                <th>REVENUE</th>
                <th>STATUS</th>
                <th style={{textAlign: 'center'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading units...</td></tr>
              ) : units.map((unit) => (
                <tr key={unit._id || unit.unitId}>
                  <td><span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-700">#{unit.unitId}</span></td>
                  <td>
                    <div className="unit-name-cell">
                      <div className="unit-icon-wrapper">
                        <MapPin size={16} />
                      </div>
                      <span className="unit-name-text">{unit.name}</span>
                    </div>
                  </td>
                  <td>{unit.region}</td>
                  <td>{unit.totalSales || 0}</td>
                  <td>₹{unit.revenue || 0}</td>
                  <td>
                    <span className={`status-badge ${(unit.status || 'Active').toLowerCase()}`}>
                      {unit.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => setEditingUnit(unit)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteUnit(unit.unitId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Unit</h2>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUnit} className="add-unit-form">
              <div className="form-group">
                <label>Unit Name</label>
                <input 
                  type="text" 
                  value={newUnit.name} 
                  onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                  placeholder="e.g. Unit E"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={newUnit.region} 
                  onChange={(e) => setNewUnit({...newUnit, region: e.target.value})}
                  placeholder="e.g. Central Region"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  value={newUnit.address} 
                  onChange={(e) => setNewUnit({...newUnit, address: e.target.value})}
                  placeholder="e.g. 123 Main St"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={newUnit.password} 
                  onChange={(e) => setNewUnit({...newUnit, password: e.target.value})}
                  placeholder="Unit account password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="action-button secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary">
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Unit Modal */}
      {editingUnit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Unit</h2>
              <button className="icon-button" onClick={() => setEditingUnit(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditUnit} className="add-unit-form">
              <div className="form-group">
                <label>Unit Name</label>
                <input 
                  type="text" 
                  value={editingUnit.name} 
                  onChange={(e) => setEditingUnit({...editingUnit, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={editingUnit.region} 
                  onChange={(e) => setEditingUnit({...editingUnit, region: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Total Sales</label>
                <input 
                  type="number" 
                  value={editingUnit.totalSales || 0} 
                  onChange={(e) => setEditingUnit({...editingUnit, totalSales: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Revenue (₹)</label>
                <input 
                  type="number" 
                  value={editingUnit.revenue || 0} 
                  onChange={(e) => setEditingUnit({...editingUnit, revenue: e.target.value})}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="action-button secondary" onClick={() => setEditingUnit(null)}>
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

export default AdminUnitsPage;
