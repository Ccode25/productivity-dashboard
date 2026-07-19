import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ToastNotification from './components/ToastNotification';
import FilterBar from './components/FilterBar';
import { useTodos } from './hooks/useTodos';
import DailySummaryView from './components/DailySummaryView';

export default function App() {
  // Toast helpers
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Edit state
  const [todoToEdit, setTodoToEdit] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // View mode switcher: 'board' or 'daily'
  const [viewMode, setViewMode] = useState('board');

  // Load and manage todos via custom hook
  const { todos, loading, error, load, create, toggleComplete, edit, remove } = useTodos(addToast);

  // Wrapper handlers that delegate to hook functions
  const handleAddTodo = async (taskData) => {
    await create(taskData);
  };

  const handleToggleComplete = async (id) => {
    await toggleComplete(id);
  };

  const handleStartEdit = (todo) => {
    setTodoToEdit(todo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEdit = async (taskData) => {
    if (!todoToEdit) return;
    await edit(todoToEdit.id, taskData);
    setTodoToEdit(null);
  };

  const handleCancelEdit = () => {
    setTodoToEdit(null);
  };

  const handleDeleteTodo = async (id) => {
    await remove(id);
    if (todoToEdit && todoToEdit.id === id) {
      setTodoToEdit(null);
    }
  };

  // Filter logic
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = !todo.completed;
    if (statusFilter === 'completed') matchesStatus = todo.completed;
    let matchesCategory = true;
    if (categoryFilter !== 'All') {
      matchesCategory = todo.category.toLowerCase() === categoryFilter.toLowerCase();
    }
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="app-container">
      <Header />

      {/* Stats Board */}
      <StatsDashboard todos={todos} />

      {/* Task Form (Adds or Edits) */}
      <TaskForm
        onSubmit={todoToEdit ? handleSaveEdit : handleAddTodo}
        todoToEdit={todoToEdit}
        onCancelEdit={handleCancelEdit}
      />

      {/* View Switcher Segmented Control */}
      <div className="view-switcher-container">
        <button 
          className={`view-switcher-btn ${viewMode === 'board' ? 'active' : ''}`}
          onClick={() => setViewMode('board')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Board View
        </button>
        <button 
          className={`view-switcher-btn ${viewMode === 'daily' ? 'active' : ''}`}
          onClick={() => setViewMode('daily')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Daily Review
        </button>
      </div>

      {/* Controls Bar (Search & Filters) */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-secondary))' }}>
          <p>Syncing task board...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ textAlign: 'center', borderColor: 'hsl(var(--danger) / 0.3)', padding: '2rem' }}>
          <p style={{ color: 'hsl(var(--danger))', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>
          <button className="btn btn-secondary" onClick={load}>Retry Connection</button>
        </div>
      ) : viewMode === 'daily' ? (
        <DailySummaryView
          todos={filteredTodos}
          onToggleComplete={handleToggleComplete}
          onEdit={handleStartEdit}
          onDelete={handleDeleteTodo}
        />
      ) : (
        <TaskList
          todos={filteredTodos}
          onToggleComplete={handleToggleComplete}
          onEdit={handleStartEdit}
          onDelete={handleDeleteTodo}
        />
      )}

      {/* Toast Alert Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
}
