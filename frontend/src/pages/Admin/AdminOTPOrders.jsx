import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader, Smartphone, AlertCircle, RefreshCcw } from 'lucide-react';

const AdminOTPOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.admin.getOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch platform OTP orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      <div className="flex justify-between align-center m-b-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Monitor OTP Orders
          </h1>
          <p className="text-secondary">View and trace all virtual numbers reserved across the entire system</p>
        </div>
        <button className="btn btn-secondary flex align-center gap-1" onClick={loadOrders} disabled={isLoading}>
          <RefreshCcw size={16} className={isLoading ? 'spinner-sm' : ''} />
          <span>Refresh</span>
        </button>
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
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-secondary">No virtual OTP orders found in platform records.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Service</th>
                  <th>Number</th>
                  <th>Sales Price</th>
                  <th>Cost Price</th>
                  <th>Activation ID</th>
                  <th>SMS OTP</th>
                  <th>Status</th>
                  <th>Reserved At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const profit = order.price - order.apiPrice;
                  return (
                    <tr key={order._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.userId?.username || 'Unknown'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{order.userId?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.service}</div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{order.country}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>+{order.phoneNumber}</td>
                      <td style={{ fontWeight: 700 }}>₹{order.price.toFixed(2)}</td>
                      <td className="text-secondary" style={{ fontFamily: 'monospace' }}>₹{order.apiPrice.toFixed(2)}</td>
                      <td className="text-secondary" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.activationId}</td>
                      <td>
                        {order.smsCode ? (
                          <span className="badge badge-success" style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                            {order.smsCode}
                          </span>
                        ) : (
                          <span className="text-secondary" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                            -
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          order.status === 'completed' ? 'badge-success' :
                          order.status === 'pending' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {new Date(order.createdAt).toLocaleString()}
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

export default AdminOTPOrders;
