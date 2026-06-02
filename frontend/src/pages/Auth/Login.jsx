import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowLeft, Loader, Shield, Zap, Globe, MessageCircle } from 'lucide-react';

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

  const handleGoogleLogin = () => {
    alert("Adding soon");
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', backgroundColor: '#0f172a' }}>
      
      {/* Left Side - Visuals */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#0b1120', 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflowY: 'auto'
      }} className="auth-left">
        
        <style>{`
          @media (max-width: 900px) {
            .auth-left { display: none !important; }
          }
          .auth-input {
            width: 100%;
            background: #0f172a;
            border: 1px solid #1e293b;
            color: #f8fafc;
            padding: 0.8rem 1rem 0.8rem 2.8rem;
            border-radius: 8px;
            font-size: 0.95rem;
            transition: all 0.2s;
          }
          .auth-input:focus {
            outline: none;
            border-color: #0ea5e9;
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
          }
          .auth-label {
            display: block;
            color: #e2e8f0;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .google-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
            background: #0f172a;
            border: 1px solid #1e293b;
            color: #e2e8f0;
            padding: 0.8rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .google-btn:hover {
            background: #1e293b;
          }
          .feature-pill {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1rem 1.2rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            max-width: 400px;
          }
        `}</style>

        <div style={{ maxWidth: '400px', margin: '0 auto', zIndex: 10 }}>
          
          {/* Mini phone mockup */}
          <div style={{ 
            width: '200px', height: '260px', background: '#0f172a', border: '6px solid #1e293b', 
            borderRadius: '24px', margin: '0 auto 1.5rem', position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ position: 'absolute', top: 0, width: '80px', height: '15px', background: '#1e293b', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}></div>
            
            <div style={{ width: '85%', background: '#1e293b', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Verification Code</div>
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                {['2','4','7','8','3','4'].map((num, i) => (
                  <div key={i} style={{ width: '20px', height: '28px', background: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontWeight: 'bold' }}>{num}</div>
                ))}
              </div>
              <div style={{ color: '#10b981', fontSize: '0.65rem', marginTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                Delivered Instantly
              </div>
            </div>
            
            <div style={{ position: 'absolute', top: '40px', right: '-20px', background: 'rgba(14,165,233,0.2)', padding: '6px', borderRadius: '8px' }}>
              <Shield size={14} color="#0ea5e9" />
            </div>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>Welcome Back!</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Sign in to access your dashboard and manage your SMS verifications.
          </p>

          <div className="feature-pill">
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.6rem', borderRadius: '8px', color: '#0ea5e9' }}><Shield size={20} /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>100% Secure</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Your data is encrypted and protected</div>
            </div>
          </div>
          
          <div className="feature-pill">
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.6rem', borderRadius: '8px', color: '#0ea5e9' }}><Zap size={20} /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Instant Delivery</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Get SMS codes within seconds</div>
            </div>
          </div>
          
          <div className="feature-pill">
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.6rem', borderRadius: '8px', color: '#0ea5e9' }}><Globe size={20} /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>180+ Countries</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Global coverage worldwide</div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#0f172a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '2rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div style={{ background: '#1e293b', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>Sign In</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Enter your credentials to access your account</p>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="auth-label" htmlFor="emailOrUsername">Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    id="emailOrUsername"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="auth-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="password"
                    id="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} style={{ 
                width: '100%', background: '#0ea5e9', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', 
                fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                transition: 'background 0.2s', opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={e => { if(!isLoading) e.currentTarget.style.background = '#0284c7' }}
              onMouseLeave={e => { if(!isLoading) e.currentTarget.style.background = '#0ea5e9' }}>
                {isLoading ? <Loader size={18} className="spinner-sm" /> : 'Sign In ➔'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
              <div style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>OR CONTINUE WITH</div>
              <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
            </div>

            <button onClick={handleGoogleLogin} className="google-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
