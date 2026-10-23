// lib/api.js - Authentication only for now

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function for all API calls
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
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
  try {
    return await apiCall('/api/users/profile');
  } catch (error) {
    return null;
  }
}

export async function logout() {
  await apiCall('/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('campus_user');
  window.location.href = '/home';
}
