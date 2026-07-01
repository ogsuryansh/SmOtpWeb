import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { 
  ShieldCheck, 
  Smartphone, 
  RefreshCw, 
  Globe2, 
  ArrowRight, 
  Cpu, 
  Lock, 
  CheckCircle,
  MessageCircle,
  Star,
  Zap,
  Globe,
  Clock,
  Check,
  CheckCircle2,
  Shield,
  Eye,
  Fingerprint,
  Server
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Landing Page Navbar */}
      <header className="landing-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1e293b',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }} className="flex justify-between align-center">
          
          {/* Stylized Glowing Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Smartphone 
              size={26} 
              style={{
                color: '#0ea5e9',
                filter: 'drop-shadow(0 2px 8px rgba(14, 165, 233, 0.4))'
              }} 
            />
            <span className="landing-logo-text" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff'
            }}>
              OTP<span style={{ color: '#0ea5e9' }}>Addaa</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="flex gap-2" style={{ display: 'none', gap: '2rem' }} id="landing-nav">
            <a href="#features" style={{ textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>Features</a>
            <a href="#services" style={{ textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>Services</a>
            <a href="#security" style={{ textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>Security</a>
          </nav>

          <style>{`
            @media (min-width: 768px) {
              #landing-nav { display: flex !important; }
            }
            .landing-actions a {
              white-space: nowrap;
            }
            @media (max-width: 480px) {
              .landing-header {
                padding: 0.75rem 1rem !important;
              }
              .landing-logo-text {
                font-size: 1.1rem !important;
              }
              .landing-actions {
                gap: 0.4rem !important;
              }
              .landing-actions a {
                padding: 0.45rem 0.85rem !important;
                font-size: 0.75rem !important;
              }
            }
          `}</style>

          {/* Right Action buttons */}
          <div className="flex align-center gap-1 landing-actions">
            {user ? (
              <Link to="/dashboard" className="btn-primary-dark" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline-dark" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary-dark" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container - Adjusted to not have max width wrapper for the full bleed hero */}
      <main style={{ flex: 1, width: '100%' }}>
        
        <style>{`
          .dark-hero-section {
            background-color: #0f172a;
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 30px 30px;
            color: #f8fafc;
            padding: 5rem 2rem 3rem;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid #1e293b;
          }
          
          .dark-hero-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 4rem;
            align-items: center;
          }

          @media (max-width: 992px) {
            .dark-hero-container {
              grid-template-columns: 1fr;
              text-align: left;
            }
          }

          .trust-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(56, 189, 248, 0.2);
            padding: 0.4rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            color: #94a3b8;
            margin-bottom: 1.5rem;
            backdrop-filter: blur(4px);
          }
          
          .hero-h1 {
            font-size: 3.8rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            font-family: var(--font-display, sans-serif);
            color: #ffffff;
            letter-spacing: -0.02em;
          }
          
          .hero-h1 .highlight {
            color: #0ea5e9;
          }

          .hero-subtitle {
            color: #94a3b8;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2.5rem;
            max-width: 90%;
          }

          .features-grid-hero {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2.5rem;
          }

          /* ── Mobile hero overrides (must come AFTER base styles) ── */
          @media (max-width: 600px) {
            .dark-hero-section {
              padding: 3rem 1.25rem 2rem;
            }
            .trust-badge {
              font-size: 0.72rem;
              padding: 0.3rem 0.75rem;
              margin-bottom: 1rem;
            }
            .hero-h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            .hero-subtitle {
              font-size: 0.9rem;
              margin-bottom: 1.5rem;
              max-width: 100%;
            }
            .features-grid-hero {
              grid-template-columns: 1fr;
              gap: 0.65rem;
              margin-bottom: 1.5rem;
            }
            .feature-chip {
              padding: 0.65rem 0.85rem;
            }
            .cta-group {
              gap: 0.65rem;
              margin-bottom: 1.25rem;
            }
            .check-list {
              gap: 1rem;
              font-size: 0.8rem;
            }
          }

          .feature-chip {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 0.8rem 1rem;
            border-radius: 12px;
            text-align: left;
            transition: border-color 0.2s;
          }
          
          .feature-chip:hover {
            border-color: rgba(56, 189, 248, 0.3);
          }

          .feature-icon-wrapper {
            background: rgba(15, 23, 42, 0.8);
            padding: 0.5rem;
            border-radius: 8px;
            color: #0ea5e9;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .feature-text h4 {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: #e2e8f0;
          }
          
          .feature-text p {
            margin: 0;
            font-size: 0.75rem;
            color: #64748b;
          }

          .cta-group {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .btn-primary-dark {
            background: #0ea5e9;
            color: #fff;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: background 0.2s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
          }
          .btn-primary-dark:hover { background: #0284c7; color: #fff; }

          .btn-outline-dark {
            background: transparent;
            color: #e2e8f0;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: background 0.2s;
            font-size: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .btn-outline-dark:hover { background: rgba(255, 255, 255, 0.05); color: #e2e8f0; }

          .check-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            color: #64748b;
            font-size: 0.85rem;
          }

          .check-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          .check-item-icon {
            color: #10b981;
          }

          /* Phone Mockup */
          .phone-mockup-wrapper {
            position: relative;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
          }

          .phone-mockup {
            background: #0f172a;
            border: 8px solid #1e293b;
            border-radius: 40px;
            height: 600px;
            position: relative;
            padding: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .phone-notch {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 25px;
            background: #1e293b;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
          }
          
          .phone-header {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            color: #64748b;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .phone-content {
            margin-top: 2.5rem;
            text-align: center;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .app-icon {
            width: 60px;
            height: 60px;
            background: #0ea5e9;
            border-radius: 16px;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
          }

          .verification-box {
            background: #1e293b;
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
            position: relative;
            z-index: 2;
          }

          /* Floating Elements Animations */
          @keyframes float-1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
          @keyframes float-2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(15px); } }
          @keyframes float-3 { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(5px); } }

          .floating-badge {
            position: absolute;
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.8rem 1.2rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10;
            color: #fff;
            white-space: nowrap;
          }

          .fb-1 { top: 40px; right: -60px; animation: float-1 6s ease-in-out infinite; }
          .fb-2 { bottom: 60px; left: -70px; animation: float-2 7s ease-in-out infinite; }
          
          @media (max-width: 450px) {
            .fb-1 { right: -10px; }
            .fb-2 { left: -10px; }
          }
          
          .floating-icon {
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          }

          .fi-1 { top: 220px; left: -20px; color: #0ea5e9; animation: float-3 5s ease-in-out infinite; }
          .fi-2 { top: 180px; right: -25px; color: #eab308; animation: float-1 8s ease-in-out infinite; }
          .fi-3 { bottom: 250px; left: -30px; color: #a855f7; animation: float-2 6s ease-in-out infinite; }

          /* Stats Bar */
          .stats-bar {
            max-width: 1200px;
            margin: 3rem auto 0;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            padding: 2rem 0;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          @media (max-width: 768px) {
            .stats-bar { grid-template-columns: repeat(2, 1fr); gap: 2rem 1rem; }
          }

          .stat-item {
            text-align: center;
          }
          
          .stat-value {
            font-size: 1.8rem;
            font-weight: 800;
            color: #0ea5e9;
            margin-bottom: 0.2rem;
          }
          
          .stat-label {
            font-size: 0.85rem;
            color: #64748b;
          }
          
          /* Common Light Page specific wrapper */
          .light-content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
            width: 100%;
          }
        `}</style>

        {/* --- Dark Hero Section --- */}
        <section className="dark-hero-section">
          <div className="dark-hero-container">
            {/* Left Content */}
            <div>
              <div className="trust-badge">
                <Shield size={14} color="#0ea5e9" />
                <span>OTPAddaa - Enterprise Communications Platform</span>
              </div>
              
              <h1 className="hero-h1">
                Global Communications<br />
                <span className="highlight">Infrastructure</span>
              </h1>
              
              <p className="hero-subtitle">
                Build scalable authentication and messaging flows with our robust API. Connect globally with secure, programmable communications.
              </p>
              
              <div className="features-grid-hero">
                <div className="feature-chip">
                  <div className="feature-icon-wrapper"><Zap size={18} /></div>
                  <div className="feature-text">
                    <h4>Low Latency API</h4>
                    <p>&lt; 50ms response</p>
                  </div>
                </div>
                <div className="feature-chip">
                  <div className="feature-icon-wrapper"><Globe size={18} /></div>
                  <div className="feature-text">
                    <h4>180+ Regions</h4>
                    <p>Direct carrier routing</p>
                  </div>
                </div>
                <div className="feature-chip">
                  <div className="feature-icon-wrapper"><Clock size={18} /></div>
                  <div className="feature-text">
                    <h4>99.99% SLA</h4>
                    <p>Enterprise reliability</p>
                  </div>
                </div>
                <div className="feature-chip">
                  <div className="feature-icon-wrapper"><Lock size={18} /></div>
                  <div className="feature-text">
                    <h4>Compliance First</h4>
                    <p>SOC2 & GDPR Ready</p>
                  </div>
                </div>
              </div>
              
              <div className="cta-group">
                {user ? (
                  <Link to="/dashboard" className="btn-primary-dark">
                    <span>Go to Dashboard</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn-primary-dark">
                    <span>Get Started Free</span>
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
              
              <div className="check-list">
                <div className="check-item"><CheckCircle2 size={16} className="check-item-icon" /> API-first design</div>
                <div className="check-item"><CheckCircle2 size={16} className="check-item-icon" /> End-to-end encryption</div>
              </div>
            </div>

            {/* Right Phone Mockup */}
            <div className="phone-mockup-wrapper">
              
              {/* Floating elements */}
              <div className="floating-badge fb-1">
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '6px', borderRadius: '50%' }}>
                  <Check size={16} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>API Uptime</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>99.99%</div>
                </div>
              </div>
              
              <div className="floating-badge fb-2">
                <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '6px', borderRadius: '8px' }}>
                  <Server size={16} color="#0ea5e9" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>API Requests</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>1B+</div>
                </div>
              </div>

              <div className="floating-icon fi-1"><Shield size={18} /></div>
              <div className="floating-icon fi-2"><Zap size={18} /></div>
              <div className="floating-icon fi-3"><Lock size={18} /></div>

              {/* Phone Frame */}
              <div className="phone-mockup">
                <div className="phone-notch"></div>
                <div className="phone-header">
                  <span>9:41</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '10px', border: '1px solid #64748b', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '1px', left: '1px', bottom: '1px', right: '3px', background: '#e2e8f0', borderRadius: '1px' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="phone-content">
                  <div className="app-icon" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Cpu size={28} color="#0ea5e9" />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>API Webhook Monitor</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Endpoint: /v1/auth/verify</p>
                  
                  <div className="verification-box" style={{ textAlign: 'left' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.5rem', fontFamily: 'monospace' }}>POST /messages</p>
                    <div style={{ fontSize: '0.9rem', color: '#10b981', fontFamily: 'var(--font-display, monospace)' }}>
                      &#123;<br/>
                      &nbsp;&nbsp;"status": 200,<br/>
                      &nbsp;&nbsp;"message": "delivered",<br/>
                      &nbsp;&nbsp;"latency": "42ms"<br/>
                      &#125;
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', marginTop: '1rem' }}>
                    <CheckCircle2 size={14} />
                    <span>Webhook triggered successfully</span>
                  </div>
                  
                  <div style={{ 
                    marginTop: 'auto', background: '#1e293b', borderRadius: '12px', padding: '1rem', 
                    display: 'flex', gap: '0.8rem', alignItems: 'center', border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <Server size={18} color="#94a3b8" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>System Status</div>
                      <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>All services <span style={{ color: '#10b981' }}>operational</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Developers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">180+</div>
              <div className="stat-label">Carrier Routes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">99.99%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Tech Support</div>
            </div>
          </div>
        </section>

        {/* --- Original Content Below Hero --- */}
        <div style={{ backgroundColor: '#0f172a' }}>
          <div className="light-content-wrapper">
          {/* Popular Services Grid */}
          <section id="services" style={{ padding: '4rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: '#ffffff' }}>
                Supported Integrations
              </h2>
              <p style={{ color: '#94a3b8' }}>Seamlessly integrate with major platforms for robust Multi-Factor Authentication (MFA).</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              
              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.2)', display: 'flex', alignItems: 'center', color: '#0ea5e9', justifyContent: 'center', margin: '0 auto' }}>
                  <MessageCircle size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#f8fafc', fontWeight: 600 }}>Telegram</h3>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', color: '#22c55e', justifyContent: 'center', margin: '0 auto' }}>
                  <MessageCircle size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#f8fafc', fontWeight: 600 }}>WhatsApp</h3>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(234, 67, 53, 0.2)', display: 'flex', alignItems: 'center', color: '#ef4444', justifyContent: 'center', margin: '0 auto' }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#f8fafc', fontWeight: 600 }}>Google / YouTube</h3>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', color: '#10b981', justifyContent: 'center', margin: '0 auto' }}>
                  <Cpu size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#f8fafc', fontWeight: 600 }}>OpenAI / ChatGPT</h3>
              </div>

            </div>
          </section>

          {/* Features Grid */}
          <section id="features" style={{ padding: '4rem 0', borderTop: '1px solid #1e293b' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: '#ffffff' }}>
                Platform Benefits
              </h2>
              <p style={{ color: '#94a3b8' }}>Engineered to provide instant, stress-free API integration</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', marginBottom: '1rem' }}>
                  <Smartphone size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>Programmable Numbers</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  Deploy cloud numbers instantly via API for two-way messaging and automated workflows. Manage your inventory programmatically.
                </p>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
                  <RefreshCw size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>Pay-as-you-go Pricing</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  Only pay for successful requests. Transparent pricing with auto-scaling to match your business needs. No hidden minimums.
                </p>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', marginBottom: '1rem' }}>
                  <Globe2 size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>Direct Carrier Routing</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  Benefit from our direct relationships with Tier-1 carriers ensuring high deliverability rates across 180+ global regions.
                </p>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1rem' }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>Enterprise Security</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  Comprehensive audit logs, role-based access control, and end-to-end encryption for all data in transit. Built for compliance.
                </p>
              </div>
            </div>
          </section>

          </div>
        </div> {/* Close light-content-wrapper early */}

        {/* --- Why Trust Us Section --- */}
        <section id="security" style={{ backgroundColor: '#0f172a', padding: '5rem 2rem', color: '#f8fafc', position: 'relative', borderTop: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', backdropFilter: 'blur(4px)' }}>
                <Shield size={14} color="#10b981" />
                <span>Enterprise-Grade Infrastructure</span>
              </div>
              
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display, sans-serif)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Built for <span style={{ color: '#10b981' }}>Scale & Security</span>
              </h2>
              
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                Your data security and platform reliability are our top priorities. Here's how we keep your integrations running flawlessly.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
              {[
                { icon: Shield, title: 'Bank-Level Security', desc: 'Your data is protected with 256-bit SSL encryption, the same security used by major financial institutions.' },
                { icon: Lock, title: 'Data Minimization', desc: 'We adhere to strict data retention policies to ensure compliance and data minimization.' },
                { icon: Eye, title: 'Compliance Ready', desc: 'Built to meet stringent global regulatory standards.' },
                { icon: Fingerprint, title: 'Secure Authentication', desc: 'Support for modern auth flows including OAuth and SAML.' },
                { icon: Server, title: '99.99% Uptime', desc: 'Our infrastructure is built for reliability with multiple redundancy layers.' },
                { icon: CheckCircle2, title: 'Verified Provider', desc: 'Trusted by over 10,000 developers worldwide with enterprise SLAs.' },
              ].map((feature, idx) => (
                <div key={idx} style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.8rem', transition: 'transform 0.2s', cursor: 'default' }}
                     onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                     onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.2rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <feature.icon size={22} />
                  </div>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.6rem' }}>{feature.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.8rem 1.2rem', borderRadius: '12px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem', borderRadius: '8px', color: '#10b981' }}><Lock size={16} /></div>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600 }}>SSL Secured</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>256-bit encryption</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.8rem 1.2rem', borderRadius: '12px' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.4rem', borderRadius: '8px', color: '#0ea5e9' }}><ShieldCheck size={16} /></div>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600 }}>Verified</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>50,000+ users</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.8rem 1.2rem', borderRadius: '12px' }}>
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '0.4rem', borderRadius: '8px', color: '#eab308' }}><Server size={16} /></div>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600 }}>99.9% Uptime</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>High availability</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #1e293b', 
        padding: '3rem 2rem', 
        backgroundColor: '#0b1120', 
        color: '#94a3b8', 
        fontSize: '0.95rem',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }} className="flex justify-between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Smartphone 
                size={18} 
                style={{ color: '#0ea5e9' }} 
              />
              <span style={{ fontWeight: 800, color: '#ffffff' }}>OTPAddaa</span>
            </div>
            <p style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#64748b' }}>Enterprise cloud communications platform powering scalable messaging and authentication flows globally.</p>
          </div>
          
          <div className="flex gap-2" style={{ gap: '3rem' }}>
            <div className="flex flex-column gap-1">
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', textTransform: 'uppercase' }}>Quick Links</span>
              <a href="#features" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.85rem' }}>Features</a>
              <a href="#services" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.85rem' }}>Pricing</a>
            </div>
            <div className="flex flex-column gap-1">
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', textTransform: 'uppercase' }}>Legal</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer' }}>Terms of Use</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer' }}>Privacy Policy</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <p>&copy; {new Date().getFullYear()} OTPAddaa. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
