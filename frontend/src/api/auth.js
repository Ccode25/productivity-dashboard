// Helper to handle API response errors safely
const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (err) {
      throw new Error('Invalid JSON format received from server.');
    }
  } else {
    if (!res.ok) {
      throw new Error(`Backend server error (${res.status}): Please check if the Express backend (port 5000) is running.`);
    }
    throw new Error('Server returned an unexpected non-JSON response.');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Authentication error occurred.');
  }
  return data;
};

// 1. Register brand new user account with Name, Email, Password, Role
export const registerAccount = async (name, email, password, role) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  return handleResponse(res);
};

// 2. Verify 6-digit email code
export const verifyEmail = async (email, code) => {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  return handleResponse(res);
};

// 3. Log in existing account using Email + Password (returns Access Token + Refresh Token)
export const loginWithEmailPassword = async (email, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

// 5. Request password reset (send email with token)
export const forgotPassword = async (email) => {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
};

// 6. Reset password using token
export const resetPassword = async (token, newPassword) => {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return handleResponse(res);
};

// 4. Rotate Refresh Token to issue a fresh Access Token + Refresh Token pair
export const refreshSession = async (refreshToken) => {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return handleResponse(res);
};

// Login as preset demo user
export const loginWithDemoUser = async (userId) => {
  const res = await fetch('/api/auth/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return handleResponse(res);
};

// Fetch available preset demo user options
export const fetchDemoUsers = async () => {
  const res = await fetch('/api/auth/demo-users');
  return handleResponse(res);
};

// Verify current session token
export const fetchCurrentUser = async (accessToken) => {
  const res = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return handleResponse(res);
};
