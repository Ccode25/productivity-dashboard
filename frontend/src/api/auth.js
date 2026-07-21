import { apiFetch, fetchWithAuth } from './apiClient';

// 1. Register brand new user account with Name, Email, Password, Role
export const registerAccount = (name, email, password, role) => 
  apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role })
  });

// 2. Verify 6-digit email code
export const verifyEmail = (email, code) => 
  apiFetch('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });

// 3. Log in existing account using Email + Password
export const loginWithEmailPassword = (email, password) => 
  apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

// 5. Request password reset (send email with token)
export const forgotPassword = (email) => 
  apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

// 6. Reset password using token
export const resetPassword = (token, newPassword) => 
  apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });

// 4. Rotate Refresh Token to issue a fresh Access Token + Refresh Token pair
export const refreshSession = (refreshToken) => 
  apiFetch('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });

// Login as preset demo user
export const loginWithDemoUser = (userId) => 
  apiFetch('/api/auth/demo', {
    method: 'POST',
    body: JSON.stringify({ userId })
  });

// Fetch available preset demo user options
export const fetchDemoUsers = () => apiFetch('/api/auth/demo-users');

// Verify current session token
export const fetchCurrentUser = (accessToken) => 
  apiFetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
