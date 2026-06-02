import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  TrendingUp, 
  PlusCircle, 
  Smartphone, 
  ShieldAlert, 
  ClipboardList, 
  Loader,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign
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
    <div style={{ color: '#f8fafc', paddingBottom: '3rem' }}>
      <style>{`
        .admin-header {
          margin-bottom: 2.5rem;
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
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          border-color: #334155;
        }
        .card-glow {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          z-index: 0;
        }
        .stat-grid-main {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-grid-sub {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .stat-value {
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          margin: 0.5rem 0;
          font-family: var(--font-display, sans-serif);
          position: relative;
          z-index: 1;
        }
        .stat-label {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          z-index: 1;
        }
        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
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
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #1e293b;
        }
        .premium-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(30, 41, 59, 0.5);
          color: #cbd5e1;
          font-size: 0.95rem;
        }
        .premium-table tr:hover td {
          background: rgba(30, 41, 59, 0.3);
        }
        .action-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }
        .badge-green { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .badge-blue { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.2); }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">Command Center</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Advanced real-time statistics and system logs</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader className="spinner" size={40} color="#0ea5e9" />
        </div>
      ) : (
        <>
          {/* Main Advanced KPI Cards */}
          <div className="stat-grid-main">
            {/* Total Users */}
            <div className="premium-card">
              <div className="card-glow" style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)' }}></div>
              <div className="icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <Users size={24} />
              </div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats?.totalUsers}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={14} color="#10b981" /> {(stats?.totalUsers - stats?.bannedUsers)} Active Users
              </div>
            </div>

            {/* Total OTP Sent */}
            <div className="premium-card">
              <div className="card-glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' }}></div>
              <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Smartphone size={24} />
              </div>
              <div className="stat-label">Total OTP Sent</div>
              <div className="stat-value">{stats?.ordersCount.completed}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Successfully delivered
              </div>
            </div>

            {/* Revenue / Balance */}
            <div className="premium-card">
              <div className="card-glow" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)' }}></div>
              <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-label">Net Revenue</div>
              <div className="stat-value">₹{stats?.totalRevenue.toFixed(2)}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={14} color="#f59e0b" /> Lifetime markup profits
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#0ea5e9" /> Live System Metrics
          </h2>

          {/* Secondary Sub-metrics */}
          <div className="stat-grid-sub">
            <div className="premium-card" style={{ padding: '1.2rem' }}>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Today's OTP Count</div>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>{stats?.ordersToday}</div>
            </div>
            <div className="premium-card" style={{ padding: '1.2rem' }}>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Pending Deposits</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', color: stats?.pendingDeposits > 0 ? '#f59e0b' : '#fff' }}>
                {stats?.pendingDeposits}
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.2rem' }}>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Total Deposit Volume</div>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>₹{stats?.totalDeposits.toFixed(0)}</div>
            </div>
            <div className="premium-card" style={{ padding: '1.2rem' }}>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Failed Orders</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', color: '#ef4444' }}>{stats?.ordersCount.failed}</div>
            </div>
          </div>

          {/* System Audit Logs */}
          <div className="premium-card" style={{ padding: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#8b5cf6" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>User Login & System History</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Action Event</th>
                    <th>User / Performed By</th>
                    <th>Meta Details</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No system audit log events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentLogs.map(log => {
                      let badgeClass = 'badge-blue';
                      if (log.action.includes('SUCCESS') || log.action.includes('APPROVE') || log.action.includes('REGISTER')) badgeClass = 'badge-green';
                      if (log.action.includes('FAIL') || log.action.includes('BAN') || log.action.includes('REJECT')) badgeClass = 'badge-red';

                      return (
                        <tr key={log._id}>
                          <td>
                            <span className={`action-badge ${badgeClass}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                            {log.userId ? (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{log.userId.username}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>{log.userId.email}</span>
                              </div>
                            ) : (
                              'System Automated'
                            )}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8', maxWidth: '300px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {JSON.stringify(log.details)}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} />
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
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
