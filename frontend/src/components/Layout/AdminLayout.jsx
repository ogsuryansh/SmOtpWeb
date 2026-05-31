import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import logoImg from '../../assets/photo_2026-05-30_02-34-44.jpg';
import { 
  ShieldAlert, 
  Users, 
  PlusCircle, 
  ClipboardList, 
  Settings, 
  ArrowLeft,
  X 
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const adminMenuItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: <ShieldAlert size={20} /> },
    { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Manage Deposits', path: '/admin/deposits', icon: <PlusCircle size={20} /> },
    { name: 'Monitor OTP Orders', path: '/admin/orders', icon: <ClipboardList size={20} /> },
    { name: 'System Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const currentPath = location.pathname;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ borderRight: '1px solid var(--danger)' }}>
        <div className="sidebar-brand">
          <img 
            src={logoImg} 
            alt="Logo" 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)'
            }} 
          />
          <span>Admin Center</span>
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar} 
            style={{ marginLeft: 'auto', color: 'var(--sidebar-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {adminMenuItems.map((item, idx) => {
            const isActive = currentPath === item.path;
            return (
              <li 
                key={idx} 
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{ '--sidebar-active': 'var(--danger)' }} // Customize color to danger red for admin theme
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

        {/* Sidebar Footer with return button */}
        <div className="sidebar-footer">
          <Link 
            to="/dashboard" 
            className="btn btn-secondary w-full"
            style={{ padding: '0.6rem', fontSize: '0.85rem' }}
            onClick={closeSidebar}
          >
            <ArrowLeft size={16} />
            <span>User Dashboard</span>
          </Link>
        </div>
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

export default AdminLayout;
