import React, { useEffect, useState, useCallback } from 'react';
import { api, API_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Copy, Check, Upload, Clock, Loader, AlertTriangle, ShieldCheck, Send, Zap, CreditCard } from 'lucide-react';
import defaultQr from '../../assets/qr.jpg';

const Deposits = () => {
  const { refreshUser } = useAuth();
  
  // Active tab: 'zapupi' (default - auto payment) or 'manual' (UTR)
  const [activeTab, setActiveTab] = useState('zapupi');

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

  // ZapUPI state
  const [zapAmount, setZapAmount] = useState('');
  const [zapLoading, setZapLoading] = useState(false);
  const [zapError, setZapError] = useState('');

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // ZapUPI pay handler
  const handleZapupiPay = async (e) => {
    e.preventDefault();
    setZapError('');

    const numAmt = parseFloat(zapAmount);
    if (!zapAmount || isNaN(numAmt) || numAmt <= 0) {
      setZapError('Please enter a valid amount');
      return;
    }
    if (numAmt < paymentInfo.minDeposit) {
      setZapError(`Minimum deposit is ₹${paymentInfo.minDeposit}`);
      return;
    }

    try {
      setZapLoading(true);
      const res = await api.deposits.zapupiCreateOrder(numAmt);
      if (res.success && res.payment_url) {
        // Redirect in same tab as required by ZapUPI
        window.location.href = res.payment_url;
      } else {
        setZapError('Failed to create payment. Please try again.');
      }
    } catch (err) {
      setZapError(err.message || 'Payment gateway error. Please try again.');
    } finally {
      setZapLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || !utr) {
      setError('Please fill all fields');
      return;
    }

    if (parseFloat(amount) < paymentInfo.minDeposit) {
      setError(`Minimum deposit amount is ₹${paymentInfo.minDeposit}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.deposits.submit({ amount, utr: utr.trim() });
      if (res.success) {
        setSuccess('Deposit request submitted successfully. Admin will review it shortly.');
        setAmount('');
        setUtr('');
        setShowSuccessModal(true);

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
        <p className="text-secondary">Add funds to your wallet to purchase OTP numbers</p>
      </div>

      {/* Payment Method Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        <button
          id="tab-zapupi"
          onClick={() => setActiveTab('zapupi')}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'zapupi' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'zapupi' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
        >
          <Zap size={16} /> Auto Pay (ZapUPI)
        </button>
        <button
          id="tab-manual"
          onClick={() => setActiveTab('manual')}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'manual' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
        >
          <CreditCard size={16} /> Manual (UTR)
        </button>
      </div>

        
      {/* ZAPUPI TAB */}
      {activeTab === 'zapupi' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Zap size={22} />
              </div>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Instant UPI Payment</h2>
                <p className="text-secondary" style={{ fontSize: '0.8rem', margin: 0 }}>Automatic credit — no manual approval needed</p>
              </div>
            </div>

            {zapError && (
              <div className="badge badge-danger w-full" style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
                {zapError}
              </div>
            )}

            <form onSubmit={handleZapupiPay}>
              <div className="form-group">
                <label className="form-label" htmlFor="zap-amount">Deposit Amount (₹)</label>
                <input
                  type="number"
                  id="zap-amount"
                  className="form-control"
                  placeholder={`Min ₹${paymentInfo.minDeposit}`}
                  min={paymentInfo.minDeposit}
                  value={zapAmount}
                  onChange={(e) => setZapAmount(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                id="zap-pay-btn"
                className="btn btn-primary w-full m-t-2"
                disabled={zapLoading || isLoadingInfo}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
              >
                {zapLoading ? (
                  <><Loader size={18} className="spinner-sm" /><span>Opening Payment...</span></>
                ) : (
                  <><Zap size={18} /><span>Pay Now with UPI</span></>
                )}
              </button>
            </form>

            <div className="badge badge-primary w-full" style={{ padding: '0.75rem 1rem', textTransform: 'none', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              ✅ Pay via any UPI app (GPay, PhonePe, Paytm etc.) — balance credited instantly after payment succeeds
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 className="card-title">How it works</h2>
            {[
              ['1', 'Enter amount & click Pay Now with UPI'],
              ['2', "You'll be redirected to a secure payment page"],
              ['3', 'Complete payment using GPay, PhonePe, or any UPI app'],
              ['4', 'Balance is credited automatically within seconds'],
            ].map(([step, text]) => (
              <div key={step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>{step}</div>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <a href="https://t.me/OTPAddaa_Support" target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}>
                <Send size={14} /><span>Need help? Telegram Support</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL UTR TAB */}
      {activeTab === 'manual' && (
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
                <div style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#ffffff', width: '100%', maxWidth: '300px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={paymentInfo.paymentQrCode.startsWith('http') ? paymentInfo.paymentQrCode : `${API_URL}${paymentInfo.paymentQrCode}`} 
                    alt="Payment QR Code" 
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} 
                  />
                </div>
              ) : (
                <div style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#ffffff', width: '100%', maxWidth: '300px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={defaultQr} 
                    alt="Payment QR Code" 
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} 
                  />
                </div>
              )}

              <div className="w-full" style={{ marginTop: '1rem' }}>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Official UPI Address</span>
                <div className="flex justify-between align-center" style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-primary)', marginTop: '0.25rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>{paymentInfo.paymentUpiId}</span>
                  <button onClick={handleCopyUpi} className="copy-btn" title="Copy UPI ID" style={{ flexShrink: 0 }}>
                    {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="badge badge-primary w-full" style={{ padding: '0.6rem 1rem', textTransform: 'none', borderRadius: 'var(--border-radius-sm)' }}>
                ℹ️ Minimum deposit amount: <b>₹{paymentInfo.minDeposit}</b>
              </div>

              <div className="w-full" style={{ marginTop: '0.5rem' }}>
                <a 
                  href="https://t.me/OTPAddaa_Support" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary w-full" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
                >
                  <Send size={14} />
                  <span>Telegram Support</span>
                </a>
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
      )}

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
                  <th>Method</th>
                  <th>UTR / Txn ID</th>
                  <th>Amount</th>
                  <th>Status</th>
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
                      <td>
                        <span className={`badge ${dep.payment_method === 'zapupi' ? 'badge-primary' : 'badge-warning'}`} style={{ textTransform: 'none', fontSize: '0.7rem' }}>
                          {dep.payment_method === 'zapupi' ? '⚡ Auto' : '📋 Manual'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dep.zapupi_txn_id || (dep.utr && dep.utr.startsWith('OTPADDAA_') ? dep.zapupi_order_id || dep.utr : dep.utr)}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{dep.amount.toFixed(2)}</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card text-center" style={{ maxWidth: '400px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <ShieldCheck size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Request Submitted</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
              Deposit request submitted, wait for few minutes.
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="btn btn-primary w-full m-t-1"
              style={{ padding: '0.6rem 1rem' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposits;
