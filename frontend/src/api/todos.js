import { refreshSession } from './auth';

// Helper to attach authorization header if access token exists
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Automatic Token Rotation & Request Retry Helper
const fetchWithTokenRotation = async (url, options = {}) => {
  const headers = getAuthHeaders();
  let response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });

  // Check if token expired (401) and attempt refresh token rotation
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshData = await refreshSession(refreshToken);
        if (refreshData.accessToken) {
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('authToken', refreshData.accessToken);
          if (refreshData.refreshToken) {
            localStorage.setItem('refreshToken', refreshData.refreshToken);
          }
          // Retry original request with fresh Access Token
          const newHeaders = getAuthHeaders();
          response = await fetch(url, { ...options, headers: { ...newHeaders, ...options.headers } });
        }
      } catch {
        console.warn('[AUTH] Token refresh failed, clearing invalid session.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authToken');
      }
    }
  }

  return response;
};

// Safe JSON parser helper
const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  if (!response.ok) {
    throw new Error(`Server status ${response.status}: Unable to reach API endpoint.`);
  }
  return null;
};

// API module for Todo CRUD operations
export const fetchTodos = async () => {
  const response = await fetchWithTokenRotation('/api/todos');
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  return parseJsonResponse(response);
};

export const addTodo = async (taskData) => {
  const response = await fetchWithTokenRotation('/api/todos', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to add task');
  }
  return response.json();
};

export const updateTodo = async (id, data) => {
  const response = await fetchWithTokenRotation(`/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTodo = async (id) => {
  const response = await fetchWithTokenRotation(`/api/todos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) throw new Error('Failed to delete task');
  return true;
};

export const fetchHistory = async () => {
  const response = await fetchWithTokenRotation('/api/todos/history');
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  return response.json();
};

export const clearHistory = async () => {
  const response = await fetchWithTokenRotation('/api/todos/history', {
    method: 'DELETE'
  });

  if (!response.ok) throw new Error('Failed to clear history');
  return true;
};
