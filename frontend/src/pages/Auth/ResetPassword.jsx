import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Lock, ArrowLeft, Loader, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
      } else {
        throw new Error(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. The link might be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card w-full" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
        {success ? (
          <div className="text-center">
            <div className="stat-icon success" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%' }}>
              <CheckCircle size={28} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>Password Reset</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Your password has been successfully updated.
            </p>
            <Link to="/login" className="btn btn-primary w-full">
              Sign In Now
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center m-b-2">
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>New Password</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Enter your new secure password below
              </p>
            </div>

            {error && (
              <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader size={18} className="spinner-sm" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>

            <div className="text-center m-t-2">
              <Link to="/login" style={{ fontSize: '0.9rem', display: 'inline-flex', alignCenter: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
