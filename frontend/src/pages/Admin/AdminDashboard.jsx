import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  TrendingUp, 
  PlusCircle, 
  Smartphone, 
  ShieldAlert, 
  ClipboardList, 
  Loader 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.admin.getStats();
      if (res.success) {
        setStats(res.stats);
        setRecentLogs(res.recentLogs);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch administrator statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Admin Dashboard
        </h1>
        <p className="text-secondary">Overview of platform status, overall revenue, and system logs</p>
      </div>

      {error && (
        <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="card flex align-center justify-center" style={{ padding: '4rem' }}>
          <Loader className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p>{stats?.totalUsers}</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{stats?.bannedUsers} accounts banned</span>
              </div>
              <div className="stat-icon primary">
                <Users size={24} />
              </div>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="stat-info">
                <h3>Markup Profits</h3>
                <p>₹{stats?.totalRevenue.toFixed(2)}</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Site earnings from markups</span>
              </div>
              <div className="stat-icon success">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div className="stat-info">
                <h3>Pending Deposits</h3>
                <p>{stats?.pendingDeposits}</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Awaiting verification approval</span>
              </div>
              <div className="stat-icon warning">
                <PlusCircle size={24} />
              </div>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div className="stat-info">
                <h3>Total Deposit Volume</h3>
                <p>₹{stats?.totalDeposits.toFixed(2)}</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Approved manual payments</span>
              </div>
              <div className="stat-icon primary" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <ClipboardList size={24} />
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="card text-center">
              <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Completed Orders</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats?.ordersCount.completed}</p>
            </div>
            <div className="card text-center">
              <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pending Orders</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats?.ordersCount.pending}</p>
            </div>
            <div className="card text-center">
              <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Failed/Cancelled Orders</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats?.ordersCount.failed}</p>
            </div>
            <div className="card text-center">
              <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Orders Created Today</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats?.ordersToday}</p>
            </div>
          </div>

          {/* System Audit Logs */}
          <div className="card m-t-2">
            <div className="flex align-center gap-2 m-b-2">
              <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Recent System & Security Logs</h2>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Performed By</th>
                    <th>Meta details</th>
                    <th>Logged Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-secondary" style={{ padding: '2rem' }}>
                        No system audit log events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentLogs.map(log => (
                      <tr key={log._id}>
                        <td>
                          <span className={`badge ${
                            log.action.includes('SUCCESS') || log.action.includes('APPROVE') ? 'badge-success' :
                            log.action.includes('FAIL') || log.action.includes('BAN') ? 'badge-danger' : 'badge-primary'
                          }`} style={{ fontSize: '0.7rem' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {log.userId ? `${log.userId.username} (${log.userId.email})` : 'System'}
                        </td>
                        <td className="text-secondary" style={{ fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: '300px', wordBreak: 'break-all' }}>
                          {JSON.stringify(log.details)}
                        </td>
                        <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
