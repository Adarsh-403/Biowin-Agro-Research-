import React, { useState, useEffect } from 'react';
import { Search, Plus, Truck, X, Edit, Trash2 } from 'lucide-react';
import './AdminConvoysPage.css';

const AdminConvoysPage = () => {
  const [convoys, setConvoys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConvoy, setEditingConvoy] = useState(null);
  const [newConvoy, setNewConvoy] = useState({ name: '', region: '', address: '', password: '', status: 'Active' });

  useEffect(() => {
    fetchConvoys();
  }, []);

  const fetchConvoys = async () => {
    try {
      const response = await fetch('/api/convoys');
      const data = await response.json();
      if (data.success) {
        setConvoys(data.convoys);
      }
    } catch (error) {
      console.error('Error fetching convoys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConvoy = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/convoys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConvoy)
      });
      const data = await response.json();
      if (data.success) {
        setConvoys([...convoys, data.convoy]);
        setIsModalOpen(false);
        setNewConvoy({ name: '', region: '', address: '', password: '', status: 'Active' });
      } else {
        alert(data.message || 'Error creating convoy');
      }
    } catch (error) {
      console.error('Error creating convoy:', error);
      alert('Failed to connect to server');
    }
  };

  const handleEditConvoy = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/convoys/${editingConvoy.convoyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingConvoy)
      });
      const data = await response.json();
      if (data.success) {
        setConvoys(convoys.map(c => c.convoyId === editingConvoy.convoyId ? { ...c, ...editingConvoy } : c));
        setEditingConvoy(null);
      } else {
        alert(data.message || 'Error updating convoy');
      }
    } catch (error) {
      console.error('Error updating convoy:', error);
      alert('Failed to connect to server');
    }
  };

  const handleDeleteConvoy = async (convoyId) => {
    if (!window.confirm("Are you sure you want to delete this convoy?")) return;
    try {
      const response = await fetch(`/api/convoys/${convoyId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setConvoys(convoys.filter(c => c.convoyId !== convoyId));
      } else {
        alert(data.message || 'Error deleting convoy');
      }
    } catch (error) {
      console.error('Error deleting convoy:', error);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="admin-convoys-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Convoy Management</h1>
          <p className="page-subtitle">Manage transportation fleets and delivery routes.</p>
        </div>
        <div className="header-actions">
          <button className="action-button primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add New Convoy
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Convoys</h3>
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search convoys..." className="search-input" />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="convoy-table">
            <thead>
              <tr>
                <th>CONVOY ID</th>
                <th>CONVOY NAME</th>
                <th>REGION</th>
                <th>VEHICLES</th>
                <th>ACTIVE ROUTES</th>
                <th>STATUS</th>
                <th style={{textAlign: 'center'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading convoys...</td></tr>
              ) : convoys.map((convoy) => (
                <tr key={convoy._id || convoy.convoyId}>
                  <td><span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-700">#{convoy.convoyId}</span></td>
                  <td>
                    <div className="convoy-name-cell">
                      <div className="convoy-icon-wrapper">
                        <Truck size={16} />
                      </div>
                      <span className="convoy-name-text">{convoy.name}</span>
                    </div>
                  </td>
                  <td>{convoy.region}</td>
                  <td>{convoy.vehicles || 0}</td>
                  <td>{convoy.activeRoutes || 0}</td>
                  <td>
                    <span className={`status-badge ${(convoy.status || 'Active').toLowerCase()}`}>
                      {convoy.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => setEditingConvoy(convoy)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteConvoy(convoy.convoyId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Convoy Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Convoy</h2>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddConvoy} className="add-convoy-form">
              <div className="form-group">
                <label>Convoy Name</label>
                <input 
                  type="text" 
                  value={newConvoy.name} 
                  onChange={(e) => setNewConvoy({...newConvoy, name: e.target.value})}
                  placeholder="e.g. Alpha Fleet"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={newConvoy.region} 
                  onChange={(e) => setNewConvoy({...newConvoy, region: e.target.value})}
                  placeholder="e.g. West Region"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  value={newConvoy.address} 
                  onChange={(e) => setNewConvoy({...newConvoy, address: e.target.value})}
                  placeholder="e.g. 789 Fleet St"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={newConvoy.password} 
                  onChange={(e) => setNewConvoy({...newConvoy, password: e.target.value})}
                  placeholder="Convoy account password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  value={newConvoy.status || 'Active'} 
                  onChange={(e) => setNewConvoy({...newConvoy, status: e.target.value})}
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
                  Create Convoy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Convoy Modal */}
      {editingConvoy && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Convoy</h2>
              <button className="icon-button" onClick={() => setEditingConvoy(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditConvoy} className="add-convoy-form">
              <div className="form-group">
                <label>Convoy Name</label>
                <input 
                  type="text" 
                  value={editingConvoy.name} 
                  onChange={(e) => setEditingConvoy({...editingConvoy, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={editingConvoy.region} 
                  onChange={(e) => setEditingConvoy({...editingConvoy, region: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Vehicles</label>
                <input 
                  type="number" 
                  value={editingConvoy.vehicles || 0} 
                  onChange={(e) => setEditingConvoy({...editingConvoy, vehicles: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Active Routes</label>
                <input 
                  type="number" 
                  value={editingConvoy.activeRoutes || 0} 
                  onChange={(e) => setEditingConvoy({...editingConvoy, activeRoutes: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editingConvoy.status || 'Active'} 
                  onChange={(e) => setEditingConvoy({...editingConvoy, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="action-button secondary" onClick={() => setEditingConvoy(null)}>
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

export default AdminConvoysPage;
