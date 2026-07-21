import { useState, useEffect, useCallback } from 'react';
import { fetchTodos, addTodo, updateTodo, deleteTodo, fetchHistory, clearHistory as apiClearHistory } from '../api/todos';

export const useTodos = (addToast, user) => {
  const [todos, setTodos] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history logs:', err);
    }
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await fetchTodos();
      setTodos(data);
      await loadHistory();
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server.');
      addToast('Failed to fetch tasks from backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, loadHistory, user]);

  // Re-fetch data whenever user session changes
  useEffect(() => {
    load();
  }, [load, user?.id]);

  const create = async (taskData) => {
    try {
      const newTodo = await addTodo(taskData);
      setTodos((prev) => [newTodo, ...prev]);
      addToast(`Task "${newTodo.title}" added!`, 'success');
      await loadHistory();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error adding task.', 'error');
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    try {
      const result = await updateTodo(id, { completed: newCompleted });
      const updated = result._createdRecurring ? { ...result } : result;
      const created = result._createdRecurring;
      if (created) {
        delete updated._createdRecurring;
      }
      
      setTodos((prev) => {
        let next = prev.map((t) => (t.id === id ? updated : t));
        if (created) {
          next = [created, ...next];
        }
        return next;
      });
      
      const msg = newCompleted
        ? `Completed: "${updated.title}"${created ? ' (recurring task scheduled!)' : ''}`
        : `Re-opened: "${updated.title}"`;
      addToast(msg, 'success');
      await loadHistory();
    } catch (err) {
      console.error(err);
      addToast('Error updating completion status.', 'error');
    }
  };

  const edit = async (id, taskData) => {
    try {
      const result = await updateTodo(id, taskData);
      const updated = result._createdRecurring ? { ...result } : result;
      const created = result._createdRecurring;
      if (created) {
        delete updated._createdRecurring;
      }
      
      setTodos((prev) => {
        let next = prev.map((t) => (t.id === id ? updated : t));
        if (created) {
          next = [created, ...next];
        }
        return next;
      });
      
      addToast(`Task "${updated.title}" updated!`, 'success');
      await loadHistory();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error updating task details.', 'error');
    }
  };

  const remove = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      addToast(`Deleted task: "${todo.title}"`, 'info');
      await loadHistory();
    } catch (err) {
      console.error(err);
      addToast('Error deleting task.', 'error');
    }
  };

  const clearHistoryLogs = async () => {
    try {
      await apiClearHistory();
      setHistory([]);
      addToast('Activity history cleared.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to clear history logs.', 'error');
    }
  };

  return { todos, history, loading, error, load, create, toggleComplete, edit, remove, clearHistoryLogs };
};
