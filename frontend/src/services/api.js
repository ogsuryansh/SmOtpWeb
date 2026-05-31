const BASE_URL = 'http://localhost:5000/api';

// Helper to make fetch calls
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Set headers
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine if we should stringify body (don't if body is FormData for file upload)
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const config = {
    ...options,
    headers,
    body,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear local storage token
      if (response.status === 401) {
        localStorage.removeItem('token');
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth API
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getMe: () => request('/auth/me'),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, password) => request(`/auth/reset-password/${token}`, { method: 'POST', body: { password } }),
  },
  
  // User Profile
  user: {
    updateProfile: (profileData) => request('/user/profile', { method: 'PUT', body: profileData }),
    getTransactions: () => request('/user/transactions'),
  },

  // Manual Deposits
  deposits: {
    paymentDetails: () => request('/deposits/payment-details'),
    submit: (formData) => request('/deposits', { method: 'POST', body: formData }),
    getHistory: () => request('/deposits'),
  },

  // OTP Purchasing & Active Polling
  otp: {
    getServices: (serviceCode = '') => request(`/otp/services?service=${serviceCode}`),
    getCountries: () => request('/otp/countries'),
    buyNumber: (serviceCode, countryCode, multiSms = false) => request('/otp/buy', { method: 'POST', body: { serviceCode, countryCode, multiSms } }),
    pollStatus: (orderId) => request(`/otp/order/${orderId}`),
    updateStatus: (orderId, action) => request('/otp/status', { method: 'POST', body: { orderId, action } }),
    getHistory: () => request('/otp/history'),
  },

  // Admin APIs
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: () => request('/admin/users'),
    updateUser: (userId, updates) => request(`/admin/users/${userId}`, { method: 'PUT', body: updates }),
    getDeposits: (status = '') => request(`/admin/deposits?status=${status}`),
    processDeposit: (depositId, approvalData) => request(`/admin/deposits/${depositId}`, { method: 'PUT', body: approvalData }),
    getOrders: () => request('/admin/orders'),
    getSettings: () => request('/admin/settings'),
    updateSettings: (settingsData) => request('/admin/settings', { method: 'PUT', body: settingsData }),
  }
};
