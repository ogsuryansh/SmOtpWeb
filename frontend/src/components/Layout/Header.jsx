import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, User, Smartphone, PlusCircle, X } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Buy OTP', path: '/buy' },
    { name: 'History', path: '/history' },
    { name: 'Deposits', path: '/deposits' },
    { name: 'Profile', path: '/profile' },
  ];

  if (user && user.role === 'admin') {
    navLinks.push({ name: 'Admin Panel', path: '/admin' });
  }

  return (
    <header className="header">
      <div className="header-container">
        
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Logo */}
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.4rem' }}>
             <Smartphone size={24} style={{ color: 'var(--primary)' }} />
             <span>OTP<span style={{ color: 'var(--primary)' }}>Addaa</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile menu toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Wallet pill */}
          {user && (
            <div className="wallet-pill" onClick={() => navigate('/deposits')} style={{ cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}>
              <PlusCircle size={16} />
              <span>₹{user.balance.toFixed(2)}</span>
            </div>
          )}

          {/* Theme toggler */}
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User profile / Logout */}
          {user && (
            <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="user-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
                 <User size={16} className="text-secondary" />
                 <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navLinks.map((link) => (
             <Link 
               key={link.path} 
               to={link.path} 
               className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
               onClick={closeMobileMenu}
             >
               {link.name}
             </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;

