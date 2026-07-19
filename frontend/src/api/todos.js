// API module for Todo CRUD operations
export const fetchTodos = async () => {
  const response = await fetch('/api/todos');
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  return response.json();
};

export const addTodo = async (taskData) => {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to add task');
  }
  return response.json();
};

export const updateTodo = async (id, data) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTodo = async (id) => {
  const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete task');
  return true;
};

export const fetchHistory = async () => {
  const response = await fetch('/api/todos/history');
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  return response.json();
};

export const clearHistory = async () => {
  const response = await fetch('/api/todos/history', { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to clear history');
  return true;
};
