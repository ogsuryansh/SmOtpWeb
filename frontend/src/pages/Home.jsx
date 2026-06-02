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
  MessageCircle
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
        backgroundColor: 'var(--header-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
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
                color: 'var(--primary)',
                filter: 'drop-shadow(0 2px 8px var(--primary-glow))'
              }} 
            />
            <span className="landing-logo-text" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)'
            }}>
              OTP<span style={{ color: 'var(--primary)' }}>Addaa</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="flex gap-2" style={{ display: 'none', gap: '2rem' }} id="landing-nav">
            <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Features</a>
            <a href="#services" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Services</a>
            <a href="#security" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Security</a>
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
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', flex: 1, width: '100%' }}>
        
        {/* Hero Section */}
        <section className="landing-hero" style={{ padding: '6rem 0 4rem' }}>
          <div className="badge badge-primary m-b-2" style={{ textTransform: 'none', padding: '0.5rem 1rem', borderRadius: '50px' }}>
            🚀 Instant verification with SastaOTP API integration
          </div>
          <h1 className="landing-title">
            Secure Virtual Numbers For <b>Verification</b>
          </h1>
          <p className="landing-subtitle">
            Buy temporary SMS verification numbers instantly for Telegram, WhatsApp, Gmail, OpenAI, and more. Cancel anytime to receive an automatic refund.
          </p>
          <div className="flex gap-2 m-t-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                <span>Access Console Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                  <span>Reserve a Number</span>
                  <ArrowRight size={18} />
                </Link>
                <a href="#services" className="btn btn-secondary btn-lg" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                  View Prices
                </a>
              </>
            )}
          </div>
        </section>

        {/* Popular Services Grid */}
        <section id="services" style={{ padding: '4rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
              Supported Services
            </h2>
            <p className="text-secondary">Low-cost temporary lines starting from just ₹5.00 per code</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            
            <div className="card text-center flex flex-column align-center gap-1" style={{ padding: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', color: '#fff', justifyContent: 'center', margin: '0 auto' }}>
                <MessageCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Telegram</h3>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Starting at</span>
              <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>₹12.00</p>
            </div>

            <div className="card text-center flex flex-column align-center gap-1" style={{ padding: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', color: '#fff', justifyContent: 'center', margin: '0 auto' }}>
                <MessageCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>WhatsApp</h3>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Starting at</span>
              <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>₹15.00</p>
            </div>

            <div className="card text-center flex flex-column align-center gap-1" style={{ padding: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#ea4335', display: 'flex', alignItems: 'center', color: '#fff', justifyContent: 'center', margin: '0 auto' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Google / YouTube</h3>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Starting at</span>
              <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>₹8.00</p>
            </div>

            <div className="card text-center flex flex-column align-center gap-1" style={{ padding: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', color: '#fff', justifyContent: 'center', margin: '0 auto' }}>
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>OpenAI / ChatGPT</h3>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Starting at</span>
              <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>₹5.00</p>
            </div>

          </div>
        </section>

        {/* Features Grid */}
        <section id="features" style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
              Platform Benefits
            </h2>
            <p className="text-secondary">Engineered to provide instant, stress-free authentication</p>
          </div>

          <div className="landing-features">
            <div className="card">
              <div className="stat-icon primary m-b-2">
                <Smartphone size={24} />
              </div>
              <h3 className="card-title">Instant Setup Lines</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                Reserve temporary lines within clicks. The reserved SIM is activated in real-time, waiting for your verification token code.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon success m-b-2">
                <RefreshCw size={24} />
              </div>
              <h3 className="card-title">No SMS, Instant Refunds</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                Don't waste funds on dry lines. If an SMS is not delivered, cancel the order manually or let it expire to get all your balance refunded automatically.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon warning m-b-2">
                <Globe2 size={24} />
              </div>
              <h3 className="card-title">Global Carrier Network</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                Avoid geographical blockers. Purchase virtual lines from 180+ global regions including India, USA, and UK.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon danger m-b-2">
                <ShieldCheck size={24} />
              </div>
              <h3 className="card-title">Audit Ledger Security</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                Full security and logging. Double hashing for passwords, token security, and comprehensive ledgers keep your wallet transactions traceably secure.
              </p>
            </div>
          </div>
        </section>

        {/* Security / Info section */}
        <section id="security" style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '1.25rem', lineHeight: '1.1' }}>
              We Secure Your Verification Privacy
            </h2>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
              Protect your personal mobile number from tracking databases and spam calls. Use temporary burner lines to register on websites safely and privately.
            </p>
            <div className="flex flex-column gap-2">
              <div className="flex align-center gap-1">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600 }}>100% Privacy Preservation</span>
              </div>
              <div className="flex align-center gap-1">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600 }}>Clean Manual UPI Deposits System</span>
              </div>
              <div className="flex align-center gap-1">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600 }}>Audit Logs & Wallet ledger logs</span>
              </div>
            </div>
          </div>
          
          <div className="card flex flex-column gap-2" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.05), rgba(6,182,212,0.05))', borderColor: 'var(--primary)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>How It Works</h3>
            
            <div className="flex gap-2">
              <div style={{ backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', minWidth: '28px' }}>1</div>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}><b>Fund Wallet:</b> Deposit using UPI QR and input UTR proof to credit your account balance.</p>
            </div>

            <div className="flex gap-2">
              <div style={{ backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', minWidth: '28px' }}>2</div>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}><b>Buy Code:</b> Select the service (Telegram/WhatsApp) and country, then reserve a virtual line.</p>
            </div>

            <div className="flex gap-2">
              <div style={{ backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', minWidth: '28px' }}>3</div>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}><b>Verify:</b> Use the phone number. Watch the verification code appear instantly on your dashboard.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '3rem 2rem', 
        backgroundColor: 'var(--bg-secondary)', 
        color: 'var(--text-secondary)', 
        fontSize: '0.95rem',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }} className="flex justify-between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Smartphone 
                size={18} 
                style={{ color: 'var(--primary)' }} 
              />
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>OTPAddaa</span>
            </div>
            <p style={{ maxWidth: '300px', fontSize: '0.85rem' }}>Secure temporary virtual numbers for seamless online verifications worldwide.</p>
          </div>
          
          <div className="flex gap-2" style={{ gap: '3rem' }}>
            <div className="flex flex-column gap-1">
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Quick Links</span>
              <a href="#features" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>Features</a>
              <a href="#services" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>Pricing</a>
            </div>
            <div className="flex flex-column gap-1">
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Legal</span>
              <span style={{ fontSize: '0.85rem' }}>Terms of Use</span>
              <span style={{ fontSize: '0.85rem' }}>Privacy Policy</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem' }}>
          <p>&copy; {new Date().getFullYear()} OTPAddaa. All rights reserved. Powered by SastaOTP API integration.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
