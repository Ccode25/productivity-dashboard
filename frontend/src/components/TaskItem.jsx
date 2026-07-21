import React from 'react';
import { formatTodoDate, isTodoOverdue } from '../utils/date';
import Badge from './common/Badge';
import { CheckmarkIcon, RepeatIcon, EditIcon, DeleteIcon, CalendarIcon } from './common/Icons';

export default function TaskItem({ todo, onToggleComplete, onEdit, onDelete, variant = 'board' }) {
  const { id, title, description, category, dueDate, priority, completed, repeat } = todo;

  const overdue = isTodoOverdue(dueDate, completed);
  const categoryClass = `category-${(category || 'other').toLowerCase()}`;

  // Helper Sub-components for structure
  const Checkbox = () => (
    <div className="checkbox-wrapper">
      <button
        type="button"
        aria-label={completed ? "Mark task as incomplete" : "Mark task as complete"}
        className={`custom-checkbox ${completed ? 'checked' : ''}`}
        onClick={() => onToggleComplete(id)}
      >
        {completed && <CheckmarkIcon />}
      </button>
    </div>
  );

  const Actions = ({ size = 14 }) => (
    <div className={variant === 'daily' ? 'daily-task-actions' : 'todo-actions'}>
      <button
        type="button"
        className="action-btn edit-btn"
        onClick={() => onEdit(todo)}
        title="Edit Task"
      >
        <EditIcon size={size} />
      </button>
      <button
        type="button"
        className="action-btn delete-btn"
        onClick={() => onDelete(id)}
        title="Delete Task"
      >
        <DeleteIcon size={size} />
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
          <Badge type="category" value={category || 'Other'} />
          <Badge type="priority" value={priority} />
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
        <div className="todo-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span className="todo-title">{title}</span>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
            <Badge type="category" value={category || 'Other'} />
            <Badge type="priority" value={priority} />
          </div>
        </div>
        
        {description && <p className="todo-desc">{description}</p>}
        
        <div className="todo-meta">
          <div className={`meta-item ${overdue ? 'due-date-alert' : ''}`}>
            <CalendarIcon />
            <span>{dueDate ? (overdue ? `Overdue: ${formatTodoDate(dueDate)}` : `Due: ${formatTodoDate(dueDate)}`) : 'No Due Date'}</span>
          </div>
          {repeat && repeat !== 'none' && (
            <div className="meta-item repeat-badge" style={{ color: 'hsl(var(--primary))', gap: '0.25rem' }}>
              <RepeatIcon size={12} />
              <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>{repeat}</span>
            </div>
          )}
        </div>
      </div>

      <Actions size={16} />
    </div>
  );
}
