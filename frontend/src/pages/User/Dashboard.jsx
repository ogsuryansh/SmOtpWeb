import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  Smartphone, 
  Loader, 
  AlertCircle, 
  History, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RefreshCcw,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [copiedText, setCopiedText] = useState({});
  const [timers, setTimers] = useState({});
  
  // Track interval references to clear them on unmount
  const pollIntervals = useRef({});

  // Fetch active orders and transactions
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoadingActive(true);
      // Fetch user orders history to find pending ones
      const ordersRes = await api.otp.getHistory();
      if (ordersRes.success) {
        const pending = ordersRes.orders.filter(o => o.status === 'pending');
        setActiveOrders(pending);
      }

      // Fetch transaction logs
      const transRes = await api.user.getTransactions();
      if (transRes.success) {
        setTransactions(transRes.transactions.slice(0, 10)); // Top 10
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingActive(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    return () => {
      // Clear all active polling intervals on unmount
      Object.values(pollIntervals.current).forEach(clearInterval);
    };
  }, [fetchDashboardData]);

  // Polling logic for a specific order
  const startPolling = useCallback((orderId) => {
    if (pollIntervals.current[orderId]) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.otp.pollStatus(orderId);
        if (res.success) {
          const updatedOrder = res.order;
          
          if (updatedOrder.status !== 'pending') {
            // Stop polling
            clearInterval(pollIntervals.current[orderId]);
            delete pollIntervals.current[orderId];

            // Refresh user balance & transaction list
            refreshUser();
            
            // Update active list
            setActiveOrders(prev => prev.filter(o => o._id !== orderId));
            
            // Refresh transaction logs
            const transRes = await api.user.getTransactions();
            if (transRes.success) setTransactions(transRes.transactions.slice(0, 10));
          } else {
            // Still pending, update in UI (could have updated timers, etc.)
            setActiveOrders(prev => 
              prev.map(o => o._id === orderId ? updatedOrder : o)
            );
          }
        }
      } catch (err) {
        console.error('Error polling order:', orderId, err);
      }
    }, 5000); // Poll every 5s

    pollIntervals.current[orderId] = interval;
  }, [refreshUser]);

  // Start polling for all active orders loaded initially
  useEffect(() => {
    activeOrders.forEach(order => {
      if (order.status === 'pending') {
        startPolling(order._id);
      }
    });
  }, [activeOrders, startPolling]);

  // Countdown timer logic
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const newTimers = {};
      activeOrders.forEach(order => {
        const expiry = new Date(order.expiresAt).getTime();
        const now = Date.now();
        const diff = expiry - now;

        if (diff <= 0) {
          newTimers[order._id] = 'Expired';
          // Trigger local update if expired in countdown (backend poll will auto refund)
          if (pollIntervals.current[order._id]) {
            clearInterval(pollIntervals.current[order._id]);
            delete pollIntervals.current[order._id];
            
            // Fetch fresh dashboard data to update tables/balance
            setTimeout(() => {
              fetchDashboardData();
              refreshUser();
            }, 1000);
          }
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          newTimers[order._id] = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeOrders, fetchDashboardData, refreshUser]);

  // Copy to clipboard helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedText(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Cancel order manually
  const handleCancelOrder = async (orderId) => {
    try {
      const res = await api.otp.updateStatus(orderId, 'cancel');
      if (res.success) {
        // Stop polling
        if (pollIntervals.current[orderId]) {
          clearInterval(pollIntervals.current[orderId]);
          delete pollIntervals.current[orderId];
        }
        
        // Remove from list
        setActiveOrders(prev => prev.filter(o => o._id !== orderId));
        
        // Update balance and tables
        refreshUser();
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  return (
    <div>
      {/* Upper Welcome and Stat summary */}
      <div className="flex justify-between align-center m-b-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Welcome, {user?.username} 👋
          </h1>
          <p className="text-secondary">Manage your active numbers and monitor your wallet balance.</p>
        </div>
        <Link to="/buy" className="btn btn-primary btn-lg">
          <Smartphone size={18} />
          <span>Buy New Number</span>
        </Link>
      </div>

      {/* Balance & Stat widgets */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-info">
            <h3>Wallet Balance</h3>
            <p>₹{user?.balance.toFixed(2)}</p>
          </div>
          <div className="stat-icon primary">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Active Orders</h3>
            <p>{activeOrders.length}</p>
          </div>
          <div className="stat-icon warning">
            <Loader size={24} className={activeOrders.length > 0 ? 'spinner-sm' : ''} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Role Status</h3>
            <p style={{ textTransform: 'capitalize', fontSize: '1.25rem', marginTop: '0.4rem' }}>{user?.role}</p>
          </div>
          <div className="stat-icon success">
            <TrendingDown size={24} style={{ transform: 'rotate(180deg)' }} />
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="m-b-2">
        <div className="flex align-center gap-2 m-b-2">
          <Smartphone size={20} className="text-primary" />
          <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>Active Numbers</h2>
          {activeOrders.length > 0 && <span className="badge badge-primary">{activeOrders.length} Pending</span>}
        </div>

        {isLoadingActive ? (
          <div className="card flex align-center justify-center" style={{ padding: '3rem' }}>
            <Loader className="spinner" />
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>No active numbers reserved at the moment.</p>
            <Link to="/buy" className="btn btn-secondary">
              Go to Purchase Panel
            </Link>
          </div>
        ) : (
          <div className="active-orders-grid">
            {activeOrders.map(order => (
              <div key={order._id} className="order-card card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="order-header">
                  <div className="order-service">
                    <span>{order.service} ({order.country})</span>
                  </div>
                  <span className="badge badge-warning" style={{ fontFamily: 'monospace' }}>
                    ⏳ {timers[order._id] || 'Loading...'}
                  </span>
                </div>

                <div>
                  <span className="form-label" style={{ fontSize: '0.75rem' }}>Reserved Number</span>
                  <div className="order-number">
                    <span>+{order.phoneNumber}</span>
                    <button 
                      onClick={() => handleCopy(`+${order.phoneNumber}`, order._id)} 
                      className="copy-btn"
                      title="Copy phone number"
                    >
                      {copiedText[order._id] ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* OTP status box */}
                <div className="otp-box" style={{ background: 'var(--bg-primary)', border: '1px dashed var(--border-color)' }}>
                  <Loader size={20} className="spinner-sm text-primary" style={{ marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Waiting for SMS verification code...
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCancelOrder(order._id)} 
                    className="btn btn-danger w-full"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    <XCircle size={14} />
                    <span>Cancel & Refund</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="card">
        <div className="flex justify-between align-center m-b-2">
          <div className="flex align-center gap-2">
            <History size={20} className="text-secondary" />
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Recent Wallet Logs</h2>
          </div>
          <Link to="/profile" className="flex align-center gap-1" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Profile Settings</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount (INR)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-secondary" style={{ padding: '2rem' }}>
                    No wallet transaction history found.
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
      </div>
    </div>
  );
};

export default Dashboard;
