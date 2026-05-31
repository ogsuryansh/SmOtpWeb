import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Mail, ArrowLeft, Loader, HelpCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devResetToken, setDevResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setDevResetToken('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.forgotPassword(email);
      if (res.success) {
        setMessage(res.message);
        // Save the token returned in dev mode
        if (res.resetToken) {
          setDevResetToken(res.resetToken);
        }
      } else {
        throw new Error(res.message || 'Request failed');
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card w-full" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div className="text-center m-b-2">
          <div className="stat-icon primary" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%' }}>
            <HelpCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>Reset Password</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            We'll send you instructions to reset your password
          </p>
        </div>

        {error && (
          <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
            {error}
          </div>
        )}

        {message && (
          <div className="badge badge-success w-full m-b-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none', whiteSpace: 'normal', lineHeight: '1.4' }}>
            {message}
          </div>
        )}

        {devResetToken && (
          <div className="otp-box m-b-2" style={{ padding: '1rem', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>DEVELOPMENT AUTO-RESET TRIGGER</span>
            <p style={{ fontSize: '0.8rem', margin: '0.5rem 0', wordBreak: 'break-all' }}>
              We detected development mode. Click below to immediately reset password:
            </p>
            <Link to={`/reset-password/${devResetToken}`} className="btn btn-success" style={{ width: '100%', padding: '0.5rem' }}>
              Reset Password Now
            </Link>
          </div>
        )}

        {!devResetToken && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader size={18} className="spinner-sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Request Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center m-t-2">
          <Link to="/login" style={{ fontSize: '0.9rem', display: 'inline-flex', alignCenter: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
