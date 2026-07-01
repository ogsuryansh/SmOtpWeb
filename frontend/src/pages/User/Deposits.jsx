import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader, Send, Zap } from 'lucide-react';

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

  // ZapUPI state
  const [zapAmount, setZapAmount] = useState('');
  const [zapLoading, setZapLoading] = useState(false);
  const [zapError, setZapError] = useState('');

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

  return (
    <div>
      <div className="m-b-2">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Deposit Funds
        </h1>
        <p className="text-secondary">Add funds to your wallet to purchase OTP numbers</p>
      </div>

      {/* ZapUPI Payment Section */}
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
              {zapAmount && !isNaN(parseFloat(zapAmount)) && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
                  You will receive: <span style={{ color: 'var(--success)' }}>₹{(parseFloat(zapAmount) * 0.98).toFixed(2)}</span> (2% fee deducted)
                </div>
              )}
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
            ✅ Pay via any UPI app (GPay, PhonePe, Paytm etc.) — balance credited instantly after payment succeeds. Note: A 2% gateway fee is applied.
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
                  <th>Txn ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-secondary" style={{ padding: '2rem' }}>
                      No deposit records found.
                    </td>
                  </tr>
                ) : (
                  deposits.map(dep => (
                    <tr key={dep._id}>
                      <td>
                        <span className="badge badge-primary" style={{ textTransform: 'none', fontSize: '0.7rem' }}>
                          ⚡ Auto
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dep.zapupi_txn_id || dep.zapupi_order_id || dep.utr || '—'}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{dep.amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          ['approved', 'auto_approved'].includes(dep.status) ? 'badge-success' :
                          dep.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {dep.status === 'auto_approved' ? 'Auto Approved' : dep.status}
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
    </div>
  );
};

export default Deposits;
