import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, Lock, Loader, History, Key } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoadingTxns(true);
        const res = await api.user.getTransactions();
        if (res.success) {
          setTransactions(res.transactions);
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setIsLoadingTxns(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (password) {
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    try {
      setIsUpdating(true);
      const res = await api.user.updateProfile({ username, password });
      if (res.success) {
        setFormSuccess('Profile updated successfully');
        setPassword('');
        setConfirmPassword('');
        refreshUser();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          My Profile
        </h1>
        <p className="text-secondary">Manage your credentials and view your wallet ledger logs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Account Details */}
        <div className="card">
          <h2 className="card-title">Account Security</h2>

          {formError && <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>{formError}</div>}
          {formSuccess && <div className="badge badge-success w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>{formSuccess}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-static">Registered Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="email-static"
                  className="form-control"
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password (Leave blank to keep current)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {password && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader size={18} className="spinner-sm" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>Update Credentials</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Information */}
        <div className="card flex flex-column gap-2" style={{ justifyContent: 'center' }}>
          <h2 className="card-title">Wallet Snapshot</h2>
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <span className="text-secondary" style={{ fontWeight: 500 }}>Current Balance</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
              ₹{user?.balance.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <span className="text-secondary" style={{ fontWeight: 500 }}>Account Tier</span>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
              {user?.role}
            </span>
          </div>

          <div className="flex justify-between align-center">
            <span className="text-secondary" style={{ fontWeight: 500 }}>Joined Date</span>
            <span className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {user ? new Date(user.createdAt).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction table */}
      <div className="card">
        <div className="flex align-center gap-2 m-b-2">
          <History size={20} className="text-secondary" />
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Full Transaction Ledger</h2>
        </div>

        {isLoadingTxns ? (
          <div className="flex justify-center align-center" style={{ padding: '2rem' }}>
            <Loader className="spinner" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Transaction Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-secondary" style={{ padding: '2rem' }}>
                      No wallet transaction logs found.
                    </td>
                  </tr>
                ) : (
                  transactions.map(txn => {
                    const isNegative = txn.amount < 0;
                    return (
                      <tr key={txn._id}>
                        <td>
                          <span className={`badge ${
                            txn.type === 'deposit' ? 'badge-success' :
                            txn.type === 'refund' ? 'badge-primary' : 'badge-danger'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{txn.description}</td>
                        <td style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: '700',
                          color: isNegative ? 'var(--danger)' : 'var(--success)'
                        }}>
                          {isNegative ? '-' : '+'}₹{Math.abs(txn.amount).toFixed(2)}
                        </td>
                        <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                          {new Date(txn.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
