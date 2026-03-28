// lib/api.js - Authentication only for now

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function for all API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}

// ========== AUTHENTICATION FUNCTIONS ==========

export async function login(email, password) {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(userData) {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    return await apiCall('/api/users/me');
  } catch (error) {
    // Token might be expired
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}