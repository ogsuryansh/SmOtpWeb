import React, { useEffect, useState, useCallback } from 'react';
import { api, API_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Copy, Check, Upload, Clock, Loader, AlertTriangle, ShieldCheck } from 'lucide-react';

const Deposits = () => {
  const { refreshUser } = useAuth();
  
  // Payment gateway info state
  const [paymentInfo, setPaymentInfo] = useState({
    paymentUpiId: '',
    paymentQrCode: '',
    minDeposit: 10,
  });
  
  const [deposits, setDeposits] = useState([]);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  
  // Feedback states
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch payment info & user deposit history
  const fetchData = useCallback(async () => {
    try {
      setIsLoadingInfo(true);
      const details = await api.deposits.paymentDetails();
      if (details.success) {
        setPaymentInfo(details);
      }
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
    } finally {
      setIsLoadingInfo(false);
    }

    try {
      setIsLoadingHistory(true);
      const history = await api.deposits.getHistory();
      if (history.success) {
        setDeposits(history.deposits);
      }
    } catch (err) {
      console.error('Failed to fetch deposit history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentInfo.paymentUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || !utr || !screenshot) {
      setError('Please fill all fields and upload screenshot proof');
      return;
    }

    if (parseFloat(amount) < paymentInfo.minDeposit) {
      setError(`Minimum deposit amount is ₹${paymentInfo.minDeposit}`);
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('utr', utr.trim());
    formData.append('screenshot', screenshot);

    try {
      setIsSubmitting(true);
      const res = await api.deposits.submit(formData);
      if (res.success) {
        setSuccess('Deposit request submitted successfully. Admin will review it shortly.');
        setAmount('');
        setUtr('');
        setScreenshot(null);
        
        // Reset file input in DOM
        const fileInput = document.getElementById('screenshot-file');
        if (fileInput) fileInput.value = '';

        // Refresh list
        fetchData();
        refreshUser();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Deposit Funds
        </h1>
        <p className="text-secondary">Scan QR code or pay to UPI ID, then submit UTR proof to credit your wallet balance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Left Card: Instructions & Scan QR */}
        <div className="card flex flex-column gap-2" style={{ justifyContent: 'center' }}>
          <h2 className="card-title">1. Make Payment</h2>
          
          {isLoadingInfo ? (
            <div className="flex justify-center align-center" style={{ height: '200px' }}>
              <Loader className="spinner" />
            </div>
          ) : (
            <div className="flex flex-column align-center gap-2" style={{ width: '100%' }}>
              {paymentInfo.paymentQrCode ? (
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#ffffff', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={paymentInfo.paymentQrCode.startsWith('http') ? paymentInfo.paymentQrCode : `${API_URL}${paymentInfo.paymentQrCode}`} 
                    alt="Payment QR Code" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--warning)' }} />
                  <p style={{ fontSize: '0.85rem' }}>No QR Code uploaded by administrator. Please use the UPI ID below to pay.</p>
                </div>
              )}

              <div className="w-full" style={{ marginTop: '1rem' }}>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Official UPI Address</span>
                <div className="flex justify-between align-center" style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-primary)', marginTop: '0.25rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{paymentInfo.paymentUpiId}</span>
                  <button onClick={handleCopyUpi} className="copy-btn" title="Copy UPI ID">
                    {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="badge badge-primary w-full" style={{ padding: '0.6rem 1rem', textTransform: 'none', borderRadius: 'var(--border-radius-sm)' }}>
                ℹ️ Minimum deposit amount: <b>₹{paymentInfo.minDeposit}</b>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Upload Form */}
        <div className="card">
          <h2 className="card-title">2. Submit Verification Details</h2>

          {error && <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>{error}</div>}
          {success && <div className="badge badge-success w-full m-b-2" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Deposit Amount (₹)</label>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder={`Min ₹${paymentInfo.minDeposit}`}
                min={paymentInfo.minDeposit}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="utr">UTR / Transaction ID</label>
              <input
                type="text"
                id="utr"
                className="form-control"
                placeholder="12-digit transaction UTR number"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\s/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="screenshot-file">Upload Screenshot Proof</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  id="screenshot-file"
                  className="form-control"
                  style={{ padding: '0.5rem 1rem' }}
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader size={18} className="spinner-sm" />
                  <span>Verifying deposit...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* History table */}
      <div className="card">
        <h2 className="card-title">Deposit History</h2>
        
        {isLoadingHistory ? (
          <div className="flex justify-center align-center" style={{ padding: '2rem' }}>
            <Loader className="spinner" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>UTR / Txn ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Remarks / Admin Notes</th>
                  <th>Requested Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-secondary" style={{ padding: '2rem' }}>
                      No deposit request logs found.
                    </td>
                  </tr>
                ) : (
                  deposits.map(dep => (
                    <tr key={dep._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{dep.utr}</td>
                      <td style={{ fontWeight: 700 }}>₹{dep.amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          dep.status === 'approved' ? 'badge-success' :
                          dep.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="text-secondary" style={{ fontWeight: 500 }}>
                        {dep.remarks || '-'}
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {new Date(dep.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposits;
