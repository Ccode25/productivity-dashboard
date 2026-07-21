import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ToastNotification from './components/ToastNotification';
import FilterBar from './components/FilterBar';
import { useTodos } from './hooks/useTodos';
import DailySummaryView from './components/DailySummaryView';
import ProductivityView from './components/ProductivityView';
import HistoryView from './components/HistoryView';
import LandingPage from './components/auth/LandingPage';
import useAuth from './hooks/useAuth';

export default function App() {
  const { user } = useAuth();

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

  // Load and manage todos via custom hook (passing current user)
  const { todos, history, loading, error, load, create, toggleComplete, edit, remove, clearHistoryLogs } = useTodos(addToast, user);

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

  if (!user) {
    return (
      <>
        <LandingPage />
        <div className="toast-container">
          {toasts.map(toast => (
            <ToastNotification
              key={toast.id}
              toast={toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="app-container">
      <Header />

      {/* Stats Board */}
      <StatsDashboard todos={todos} />

      {/* Task Form (Adds or Edits) - Hidden in Productivity & History Views */}
      {viewMode !== 'productivity' && viewMode !== 'history' && (
        <TaskForm
          onSubmit={todoToEdit ? handleSaveEdit : handleAddTodo}
          todoToEdit={todoToEdit}
          onCancelEdit={handleCancelEdit}
        />
      )}

      {/* Filter and View Switcher */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Content Areas */}
      {loading ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'hsl(var(--text-secondary))', margin: 0, fontWeight: 500 }}>Syncing user tasks from backend...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem 0' }}>
          <p style={{ color: 'hsl(var(--danger))', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>
          <button className="btn btn-secondary" onClick={load}>Retry Connection</button>
        </div>
      ) : viewMode === 'productivity' ? (
        <ProductivityView todos={todos} />
      ) : viewMode === 'history' ? (
        <HistoryView history={history} onClearHistory={clearHistoryLogs} />
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
