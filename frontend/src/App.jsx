import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Imports
import DashboardLayout from './components/Layout/DashboardLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// User Pages
import Dashboard from './pages/User/Dashboard';
import BuyOtp from './pages/User/BuyOtp';
import Deposits from './pages/User/Deposits';
import Profile from './pages/User/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminDeposits from './pages/Admin/AdminDeposits';
import AdminOTPOrders from './pages/Admin/AdminOTPOrders';
import AdminSettings from './pages/Admin/AdminSettings';

// Loading Screen
import { Loader } from 'lucide-react';

const FullPageLoader = () => (
  <div style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
    <Loader size={48} className="spinner" />
  </div>
);

// Protected Route for Users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.isBanned) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--danger)' }}>Account Suspended</h1>
        <p className="text-secondary">Your account has been banned by administrators. Contact support if you believe this is an error.</p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return children;
};

// Admin Only Route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

// Public Route (Login / Register redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected User Dashboard Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="buy" element={<BuyOtp />} />
              <Route path="deposits" element={<Deposits />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Protected Admin Console Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="deposits" element={<AdminDeposits />} />
              <Route path="orders" element={<AdminOTPOrders />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
