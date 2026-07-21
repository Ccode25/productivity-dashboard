import { fetchWithAuth } from './apiClient';

export const fetchTodos = () => fetchWithAuth('/api/todos');

export const addTodo = (taskData) => fetchWithAuth('/api/todos', {
  method: 'POST',
  body: JSON.stringify(taskData),
});

export const updateTodo = (id, data) => fetchWithAuth(`/api/todos/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteTodo = (id) => fetchWithAuth(`/api/todos/${id}`, {
  method: 'DELETE'
});

export const fetchHistory = () => fetchWithAuth('/api/todos/history');

export const clearHistory = () => fetchWithAuth('/api/todos/history', {
  method: 'DELETE'
});
