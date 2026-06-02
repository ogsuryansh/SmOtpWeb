import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Loader, 
  Smartphone 
} from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState({});
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState({});

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.otp.getHistory();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedText(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleRequestNextOtp = async (orderId) => {
    try {
      setIsRetrying(prev => ({ ...prev, [orderId]: true }));
      setError('');
      const res = await api.otp.updateStatus(orderId, 'retry');
      if (res.success) {
        // Redirect to dashboard where the pending order will be polled automatically
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to request next OTP code.');
    } finally {
      setIsRetrying(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Filter orders by service name or phone number
  const filteredOrders = orders.filter(order => {
    const serviceName = (order.service || '').toLowerCase();
    const phone = (order.phoneNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return serviceName.includes(query) || phone.includes(query);
  });

  return (
    <div>
      <div className="flex justify-between align-center m-b-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Order History</h1>
          <p className="text-secondary">View all your past numbers, received OTPs, and reuse multi-OTP numbers</p>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
          {error}
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className="card m-b-2" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search by phone number or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.2rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <button 
            onClick={fetchHistory} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '40px' }}
          >
            <RefreshCw size={16} className={isLoading ? 'spinner-sm' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card flex align-center justify-center" style={{ padding: '4rem' }}>
          <Loader className="spinner" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>No orders found.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Country</th>
                  <th>Phone Number</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Received OTP</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const statusColors = {
                    pending: 'badge-warning',
                    completed: 'badge-success',
                    cancelled: 'badge-danger',
                    expired: 'badge-secondary'
                  };

                  return (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Smartphone size={15} style={{ color: 'var(--primary)' }} />
                          <span>{order.service}</span>
                          {order.multiSms && (
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', marginLeft: '0.25rem' }}>
                              Multi
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{order.country}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace', fontWeight: 600 }}>
                          <span>+{order.phoneNumber}</span>
                          <button 
                            onClick={() => handleCopy(`+${order.phoneNumber}`, `${order._id}_phone`)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex', alignItems: 'center' }}
                            title="Copy Phone Number"
                          >
                            {copiedText[`${order._id}_phone`] ? (
                              <Check size={14} style={{ color: 'var(--success)' }} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>₹{order.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${statusColors[order.status] || 'badge-secondary'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.smsCode ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ 
                              background: 'var(--bg-primary)', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border-color)', 
                              fontFamily: 'monospace', 
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: 'var(--primary)'
                            }}>
                              {order.smsCode}
                            </span>
                            <button 
                              onClick={() => handleCopy(order.smsCode, order._id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex', alignItems: 'center' }}
                              title="Copy OTP"
                            >
                              {copiedText[order._id] ? (
                                <Check size={14} style={{ color: 'var(--success)' }} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        ) : order.status === 'pending' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <Loader size={12} className="spinner-sm" /> Waiting...
                          </span>
                        ) : (
                          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td>
                        {order.multiSms && order.status === 'completed' && (
                          <button 
                            className="btn btn-primary"
                            style={{ 
                              padding: '0.35rem 0.75rem', 
                              fontSize: '0.75rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.3rem',
                              whiteSpace: 'nowrap'
                            }}
                            disabled={isRetrying[order._id]}
                            onClick={() => handleRequestNextOtp(order._id)}
                          >
                            {isRetrying[order._id] ? (
                              <Loader size={12} className="spinner-sm" />
                            ) : (
                              <RefreshCw size={12} />
                            )}
                            <span>Get Next OTP</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
