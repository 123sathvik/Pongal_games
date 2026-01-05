// authUtils.js - Updated to redirect to home on logout

const API_BASE_URL = 'http://localhost:8000';

// Get stored token
export const getToken = () => {
  return localStorage.getItem('adminToken');
};

// Set token
export const setToken = (token) => {
  localStorage.setItem('adminToken', token);
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem('adminToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Verify token with backend
export const verifyToken = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      removeToken();
      return false;
    }

    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    removeToken();
    return false;
  }
};

// Logout - Redirects to home page
export const logout = async () => {
  const token = getToken();
  
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  removeToken();
  window.location.href = '/'; // Redirect to home page instead of login
};

// Make authenticated API request
export const authFetch = async (url, options = {}) => {
  const token = getToken();
  
  if (!token) {
    window.location.href = '/admin-login';
    throw new Error('Not authenticated');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // If unauthorized, redirect to login
    if (response.status === 401) {
      removeToken();
      window.location.href = '/admin-login';
      throw new Error('Session expired');
    }

    return response;
  } catch (error) {
    if (error.message === 'Session expired') {
      throw error;
    }
    throw new Error(`API Error: ${error.message}`);
  }
};