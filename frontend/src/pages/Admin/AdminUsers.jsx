import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Search, Loader, ShieldAlert, Ban, Shield, Wallet, X } from 'lucide-react';

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
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Manage Users
        </h1>
        <p className="text-secondary">View user metrics, ban accounts, adjust wallet balances, and configure roles</p>
      </div>

      {error && (
        <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
          {error}
        </div>
      )}

      {/* Toolbar / Search */}
      <div className="card m-b-2" style={{ padding: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="card flex align-center justify-center" style={{ padding: '4rem' }}>
          <Loader className="spinner" />
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Balance</th>
                  <th>Banned</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary" style={{ padding: '2rem' }}>
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td style={{ fontWeight: 600 }}>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{user.balance.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${user.isBanned ? 'badge-danger' : 'badge-success'}`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            title="Adjust Balance"
                          >
                            <Wallet size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleToggleRole(user._id, user.role)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            title="Change Role"
                          >
                            <Shield size={14} />
                          </button>

                          <button
                            onClick={() => handleToggleBan(user._id, user.isBanned)}
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', backgroundColor: user.isBanned ? 'var(--success)' : 'var(--danger)' }}
                            title={user.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            <Ban size={14} />
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedUser(null)}>
              <X size={20} />
            </button>
            <h2 className="card-title m-b-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Adjust Balance — {selectedUser.username}
            </h2>

            <form onSubmit={handleAdjustBalance}>
              <div className="badge badge-primary w-full m-b-2" style={{ padding: '0.6rem', textTransform: 'none', borderRadius: 'var(--border-radius-sm)' }}>
                Current wallet balance: <b>₹{selectedUser.balance.toFixed(2)}</b>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adjustAmount">
                  Amount Adjustment (Use + for credit, - for debit)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="adjustAmount"
                  className="form-control"
                  placeholder="e.g. 50 or -25"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adjustRemark">
                  Reason / Remark
                </label>
                <input
                  type="text"
                  id="adjustRemark"
                  className="form-control"
                  placeholder="e.g. Manual payment loading"
                  value={adjustRemark}
                  onChange={(e) => setAdjustRemark(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isAdjusting}>
                {isAdjusting ? <Loader size={18} className="spinner-sm" /> : 'Apply Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
