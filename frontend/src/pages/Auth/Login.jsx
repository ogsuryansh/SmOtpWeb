import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!emailOrUsername || !password) {
      setFormError('Please enter all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(emailOrUsername, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Invalid login details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card w-full" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div className="text-center m-b-2">
          <div className="stat-icon primary" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%' }}>
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>Welcome Back</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Login to access your OTP wallet
          </p>
        </div>

        {formError && (
          <div className="badge badge-danger w-full m-b-2" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)', display: 'block', textTransform: 'none' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="emailOrUsername">Email or Username</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                id="emailOrUsername"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Username or email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between align-center">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full m-t-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader size={18} className="spinner-sm" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-secondary m-t-2" style={{ fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
