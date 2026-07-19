import React from 'react';
import { formatTodoDate, isTodoOverdue } from '../utils/date';

export default function TaskItem({ todo, onToggleComplete, onEdit, onDelete, variant = 'board' }) {
  const { id, title, description, category, dueDate, completed, repeat } = todo;

  const overdue = isTodoOverdue(dueDate, completed);
  const categoryClass = `category-${(category || 'other').toLowerCase()}`;

  // Helper Sub-components to eliminate SVG and markup redundancy
  const Checkbox = () => (
    <div className="checkbox-wrapper">
      <button
        type="button"
        aria-label={completed ? "Mark task as incomplete" : "Mark task as complete"}
        className={`custom-checkbox ${completed ? 'checked' : ''}`}
        onClick={() => onToggleComplete(id)}
      >
        {completed && (
          <svg className="checkmark-icon" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  );

  const CategoryBadge = () => (
    <span className={`badge badge-${(category || 'other').toLowerCase()}`}>
      {category}
    </span>
  );

  const RepeatIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"></polyline>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
      <polyline points="7 23 3 19 7 15"></polyline>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
  );

  const Actions = ({ size = 14 }) => (
    <div className={variant === 'daily' ? 'daily-task-actions' : 'todo-actions'}>
      <button
        type="button"
        className="action-btn edit-btn"
        onClick={() => onEdit(todo)}
        title="Edit Task"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button
        type="button"
        className="action-btn delete-btn"
        onClick={() => onDelete(id)}
        title="Delete Task"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );

  // 1. Daily Review Compact Row Layout
  if (variant === 'daily') {
    return (
      <div className={`daily-task-row ${completed ? 'completed' : ''} ${categoryClass}`}>
        <Checkbox />

        <div className="daily-task-info">
          <span className="daily-task-title">{title}</span>
          {description && (
            <span className="daily-task-desc-trunc" title={description}>
              {description}
            </span>
          )}
        </div>

        <div className="daily-task-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {repeat && repeat !== 'none' && (
            <span 
              className="repeat-icon-inline" 
              title={`Repeats ${repeat}`}
              style={{ display: 'flex', alignItems: 'center', color: 'hsl(var(--primary))' }}
            >
              <RepeatIcon size={12} />
            </span>
          )}
          <CategoryBadge />
        </div>

        <Actions size={14} />
      </div>
    );
  }

  // 2. Standard Board Card Layout
  return (
    <div className={`todo-card ${completed ? 'completed' : ''} ${categoryClass}`}>
      <Checkbox />

      <div className="todo-content">
        <div className="todo-title-row">
          <span className="todo-title">{title}</span>
          <CategoryBadge />
        </div>
        
        {description && <p className="todo-desc">{description}</p>}
        
        {(dueDate || overdue || (repeat && repeat !== 'none')) && (
          <div className="todo-meta">
            {(dueDate || overdue) && (
              <div className={`meta-item ${overdue ? 'due-date-alert' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{overdue ? `Overdue: ${formatTodoDate(dueDate)}` : `Due: ${formatTodoDate(dueDate)}`}</span>
              </div>
            )}
            {repeat && repeat !== 'none' && (
              <div className="meta-item repeat-badge" style={{ color: 'hsl(var(--primary))', gap: '0.25rem' }}>
                <RepeatIcon size={12} />
                <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>{repeat}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Actions size={16} />
    </div>
  );
}
