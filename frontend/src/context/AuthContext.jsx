import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user details
  const refreshUser = useCallback(async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      if (!silent) setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      const res = await api.auth.getMe();
      if (res.success) {
        setUser(res.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = async (emailOrUsername, password) => {
    setError(null);
    try {
      const res = await api.auth.login({ emailOrUsername, password });
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Google Login handler
  const googleLogin = async (credential) => {
    setError(null);
    try {
      const res = await api.auth.googleLogin(credential);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error(res.message || 'Google Login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setError(null);
    try {
      const res = await api.auth.register({ username, email, password });
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        googleLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
