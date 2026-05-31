import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Wallet, LogOut, Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>

        <div className="header-left">
          {/* Header left placeholder / page title can be added in pages */}
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Wallet pill */}
          {user && (
            <div className="wallet-pill" onClick={() => navigate('/deposits')} style={{ cursor: 'pointer' }}>
              <Wallet size={16} />
              <span>₹{user.balance.toFixed(2)}</span>
            </div>
          )}

          {/* Theme toggler */}
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User profile / Logout */}
          {user && (
            <div className="flex align-center gap-2">
              <span className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {user.username}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
