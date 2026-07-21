// Helper to get auth headers from local storage
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe JSON parser helper with error handling
export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (err) {
      throw new Error('Invalid JSON format received from server.');
    }
  } else if (!response.ok) {
    throw new Error(`Backend server error (${response.status}): Please check if the Express backend (port 5000) is running.`);
  } else if (response.ok) {
     return true; // For empty 200/204 responses like DELETE
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}.`);
  }

  return data;
};

// Simple fetch wrapper
export const apiFetch = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
};

// Token Rotation & Request Retry Helper
export const fetchWithAuth = async (url, options = {}) => {
  let headers = getAuthHeaders();
  let response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });

  // Check if token expired (401) and attempt refresh token rotation
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        // We do a raw fetch to avoid circular dependencies with auth.js
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.accessToken) {
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('authToken', refreshData.accessToken);
            if (refreshData.refreshToken) {
              localStorage.setItem('refreshToken', refreshData.refreshToken);
            }
            // Retry original request with fresh Access Token
            headers = getAuthHeaders();
            response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
          }
        } else {
            throw new Error('Refresh token invalid');
        }
      } catch {
        console.warn('[AUTH] Token refresh failed, clearing invalid session.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authToken');
      }
    }
  }

  return handleResponse(response);
};
