import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/photo_2026-05-30_02-34-44.jpg';
import { 
  LayoutDashboard, 
  Smartphone, 
  PlusCircle, 
  User, 
  Shield, 
  X 
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Buy OTP Number', path: '/buy', icon: <Smartphone size={20} /> },
    { name: 'Deposit Funds', path: '/deposits', icon: <PlusCircle size={20} /> },
    { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const currentPath = location.pathname;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img 
            src={logoImg} 
            alt="Logo" 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 2px 10px var(--primary-glow)'
            }} 
          />
          <span>SmWebOtp</span>
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar} 
            style={{ marginLeft: 'auto', color: 'var(--sidebar-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => {
            const isActive = currentPath === item.path;
            return (
              <li 
                key={idx} 
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer with Admin Panel Link */}
        {user && user.role === 'admin' && (
          <div className="sidebar-footer">
            <Link 
              to="/admin" 
              className="btn btn-primary w-full"
              style={{ padding: '0.6rem', fontSize: '0.85rem' }}
              onClick={closeSidebar}
            >
              <Shield size={16} />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <Header onMenuToggle={toggleSidebar} />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
