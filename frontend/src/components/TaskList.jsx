import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ todos, onToggleComplete, onEdit, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
            <rect x="9" y="3" width="6" height="4" rx="1" ry="1"></rect>
            <path d="M9 14l2 2 4-4"></path>
          </svg>
        </div>
        <h4 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 600 }}>No tasks found</h4>
        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
          Relax! Or try adjusting your filters or add a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="todos-list">
      {todos.map(todo => (
        <TaskItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
