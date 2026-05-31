import React, { useEffect, useState, useCallback } from 'react';
import { api, API_URL } from '../../services/api';
import { Check, X, Eye, Loader, ClipboardList, AlertCircle } from 'lucide-react';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // Default: show pending
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [viewScreenshot, setViewScreenshot] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDeposits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.admin.getDeposits(statusFilter === 'all' ? '' : statusFilter);
      if (res.success) {
        setDeposits(res.deposits);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch deposit requests');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Handle Approve Action
  const handleApprove = async (depositId, utr, amount) => {
    if (!window.confirm(`Approve payment of ₹${amount} with UTR: ${utr}? This will immediately credit the user's wallet.`)) return;

    try {
      setIsProcessing(true);
      const res = await api.admin.processDeposit(depositId, {
        status: 'approved',
        remarks: 'Approved by administrator'
      });
      
      if (res.success) {
        setDeposits(prev => prev.filter(d => d._id !== depositId));
        alert('Deposit approved and credited successfully.');
        fetchDeposits();
      }
    } catch (err) {
      alert(err.message || 'Failed to approve deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Reject Modal
  const openRejectModal = (depositId) => {
    setRejectId(depositId);
    setRejectRemarks('');
  };

  // Submit Reject Action
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      alert('Please enter reason for rejection');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await api.admin.processDeposit(rejectId, {
        status: 'rejected',
        remarks: rejectRemarks
      });

      if (res.success) {
        setDeposits(prev => prev.filter(d => d._id !== rejectId));
        setRejectId(null);
        alert('Deposit request rejected.');
        fetchDeposits();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Manage Deposits
        </h1>
        <p className="text-secondary">Process pending payments, inspect uploaded receipt screenshots, and audit financial deposits</p>
      </div>

      {error && (
        <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 m-b-2" style={{ flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
          <button
            key={tab}
            className={`btn ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="card flex align-center justify-center" style={{ padding: '4rem' }}>
          <Loader className="spinner" />
        </div>
      ) : deposits.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p className="text-secondary">No deposits requests found matching: {statusFilter}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Amount</th>
                  <th>UTR / Txn ID</th>
                  <th>Receipt Screenshot</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  {statusFilter === 'pending' && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {deposits.map(dep => (
                  <tr key={dep._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{dep.userId?.username || 'Unknown'}</div>
                      <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{dep.userId?.email}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{dep.amount.toFixed(2)}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{dep.utr}</td>
                    <td>
                      <button
                        onClick={() => setViewScreenshot(dep.screenshot)}
                        className="btn btn-secondary flex align-center gap-1"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} />
                        <span>View Proof</span>
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${
                        dep.status === 'approved' ? 'badge-success' :
                        dep.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                      {new Date(dep.createdAt).toLocaleString()}
                    </td>
                    {statusFilter === 'pending' && (
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApprove(dep._id, dep.utr, dep.amount)}
                            className="btn btn-success"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            disabled={isProcessing}
                            title="Approve & Credit Balance"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => openRejectModal(dep._id)}
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            disabled={isProcessing}
                            title="Reject & Deny"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Screenshot Modal */}
      {viewScreenshot && (
        <div className="modal-overlay" onClick={() => setViewScreenshot(null)}>
          <div className="modal-content" style={{ maxWidth: '600px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewScreenshot(null)}>
              <X size={20} />
            </button>
            <h2 className="card-title m-b-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Receipt Proof Screenshot
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#000', borderRadius: 'var(--border-radius-sm)', padding: '0.5rem' }}>
              <img 
                src={`${API_URL}${viewScreenshot}`} 
                alt="Receipt Proof" 
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Remarks Modal */}
      {rejectId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setRejectId(null)}>
              <X size={20} />
            </button>
            <h2 className="card-title m-b-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Reject Payment Request
            </h2>

            <form onSubmit={handleReject}>
              <div className="form-group">
                <label className="form-label" htmlFor="rejectRemarks">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectRemarks"
                  className="form-control"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="e.g. Invalid UTR number / Screenshot not matching payment amount"
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-danger w-full m-t-2" disabled={isProcessing}>
                {isProcessing ? <Loader size={18} className="spinner-sm" /> : 'Confirm Rejection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeposits;
