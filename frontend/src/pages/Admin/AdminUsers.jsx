import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Search, Loader, ShieldAlert, Ban, Shield, Wallet, X, UserCheck, UserX } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected user for balance adjustment modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustRemark, setAdjustRemark] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.admin.getUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search Input Filter
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle Ban Status
  const handleToggleBan = async (userId, currentBanned) => {
    if (!window.confirm(`Are you sure you want to ${currentBanned ? 'unban' : 'ban'} this user?`)) return;
    
    try {
      const res = await api.admin.updateUser(userId, { 
        isBanned: !currentBanned,
        remark: currentBanned ? 'Admin unban' : 'Violation of policy'
      });
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? res.user : u));
      }
    } catch (err) {
      alert(err.message || 'Failed to update ban status');
    }
  };

  // Toggle Admin / User role
  const handleToggleRole = async (userId, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${targetRole}?`)) return;

    try {
      const res = await api.admin.updateUser(userId, { role: targetRole });
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? res.user : u));
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  // Submit Balance Adjustment Form
  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(adjustAmount);
    if (isNaN(numericAmount) || numericAmount === 0) {
      setError('Please enter a valid non-zero adjust amount');
      return;
    }

    try {
      setIsAdjusting(true);
      const res = await api.admin.updateUser(selectedUser._id, {
        adjustBalance: numericAmount,
        remark: adjustRemark || 'Admin manual ledger adjustment'
      });

      if (res.success) {
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? res.user : u));
        setSelectedUser(null);
        setAdjustAmount('');
        setAdjustRemark('');
      }
    } catch (err) {
      setError(err.message || 'Failed to adjust balance');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div style={{ color: '#f8fafc', paddingBottom: '3rem' }}>
      <style>{`
        .admin-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .admin-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.5rem;
          font-family: var(--font-display, sans-serif);
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .premium-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .search-container {
          position: relative;
          width: 100%;
          max-width: 500px;
        }
        .premium-search {
          width: 100%;
          background: #0b1120;
          border: 1px solid #1e293b;
          color: #f8fafc;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s;
        }
        .premium-search:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
        }
        .premium-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 1rem;
        }
        .premium-table th {
          background: #0b1120;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 1.2rem 1rem;
          text-align: left;
          border-bottom: 1px solid #1e293b;
        }
        .premium-table td {
          padding: 1.2rem 1rem;
          border-bottom: 1px solid rgba(30, 41, 59, 0.5);
          color: #cbd5e1;
          font-size: 0.95rem;
          vertical-align: middle;
        }
        .premium-table tr:hover td {
          background: rgba(30, 41, 59, 0.3);
        }
        .action-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        .badge-green { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .badge-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          background: #1e293b;
          color: #94a3b8;
        }
        .action-btn:hover {
          transform: translateY(-2px);
        }
        .btn-wallet:hover { background: rgba(16, 185, 129, 0.2); color: #10b981; border-color: #10b981; }
        .btn-role:hover { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; border-color: #8b5cf6; }
        .btn-ban { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .btn-ban:hover { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }
        .btn-unban { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .btn-unban:hover { background: rgba(16, 185, 129, 0.2); border-color: #10b981; }

        .advanced-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .advanced-modal {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 20px;
          width: 90%;
          max-width: 450px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .modal-input {
          width: 100%;
          background: #0b1120;
          border: 1px solid #1e293b;
          color: #fff;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        .modal-input:focus {
          outline: none;
          border-color: #0ea5e9;
        }
        .modal-label {
          display: block;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .modal-btn {
          width: 100%;
          background: #0ea5e9;
          color: #fff;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .modal-btn:hover { background: #0284c7; }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">User Directory</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Manage accounts, adjust billing, and control access</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Toolbar / Search */}
      <div className="premium-card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem' }}>
        <div className="search-container">
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
          <input
            type="text"
            className="premium-search"
            placeholder="Search by username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader className="spinner" size={40} color="#0ea5e9" />
        </div>
      ) : (
        <div className="premium-card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Wallet Balance</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{user.username}</span>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`action-badge ${user.role === 'admin' ? 'badge-purple' : 'badge-green'}`}>
                          <Shield size={12} />
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>
                        ₹{user.balance.toFixed(2)}
                      </td>
                      <td>
                        <span className={`action-badge ${user.isBanned ? 'badge-red' : 'badge-green'}`}>
                          {user.isBanned ? <UserX size={12}/> : <UserCheck size={12}/>}
                          {user.isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="action-btn btn-wallet"
                            title="Adjust Balance"
                          >
                            <Wallet size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleToggleRole(user._id, user.role)}
                            className="action-btn btn-role"
                            title="Change Role"
                          >
                            <Shield size={16} />
                          </button>

                          <button
                            onClick={() => handleToggleBan(user._id, user.isBanned)}
                            className={`action-btn ${user.isBanned ? 'btn-unban' : 'btn-ban'}`}
                            title={user.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            <Ban size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="advanced-modal-overlay">
          <div className="advanced-modal">
            <button 
              onClick={() => setSelectedUser(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
              Billing & Balance
            </h2>

            <form onSubmit={handleAdjustBalance}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Target User</span>
                <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{selectedUser.username}</span>
              </div>
              
              <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Current Balance</span>
                <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.8rem', fontFamily: 'monospace' }}>₹{selectedUser.balance.toFixed(2)}</span>
              </div>

              <div>
                <label className="modal-label">Amount Adjustment (Use + for credit, - for debit)</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-input"
                  placeholder="e.g. 50 or -25"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="modal-label">Reason / Ledger Remark</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Manual payment loading"
                  value={adjustRemark}
                  onChange={(e) => setAdjustRemark(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="modal-btn" disabled={isAdjusting}>
                {isAdjusting ? <Loader size={20} className="spinner" style={{ margin: '0 auto' }} /> : 'Apply Ledger Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
