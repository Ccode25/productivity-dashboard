import React, { useState } from 'react';
import { formatTodoDate, isTodoOverdue } from '../utils/date';
import Badge from './common/Badge';
import { CheckmarkIcon, RepeatIcon, EditIcon, DeleteIcon, CalendarIcon } from './common/Icons';

export default function TaskItem({ todo, onToggleComplete, onEdit, onDelete, variant = 'board' }) {
  const { id, title, description, category, dueDate, priority, completed, repeat } = todo;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const overdue = isTodoOverdue(dueDate, completed);
  const categoryClass = `category-${(category || 'other').toLowerCase()}`;

  const handleToggle = async () => {
    if (isSubmitting || isDeleting) return;
    setIsSubmitting(true);
    try {
      await onToggleComplete(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting || isDeleting) return;
    
    // Check if the user really wants to delete
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  // Helper Sub-components for structure
  const Checkbox = () => (
    <div className="checkbox-wrapper">
      <button
        type="button"
        disabled={isSubmitting}
        aria-label={completed ? "Mark task as incomplete" : "Mark task as complete"}
        className={`custom-checkbox ${completed ? 'checked' : ''}`}
        onClick={handleToggle}
        style={{ opacity: isSubmitting || isDeleting ? 0.5 : 1, cursor: isSubmitting || isDeleting ? 'wait' : 'pointer' }}
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
        onClick={handleDelete}
        title="Delete Task"
        disabled={isDeleting}
        style={{ opacity: isDeleting ? 0.5 : 1, cursor: isDeleting ? 'wait' : 'pointer' }}
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
            <div className="meta-item repeat-badge">
              <RepeatIcon size={14} />
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{repeat}</span>
            </div>
          )}
        </div>
      </div>

      <Actions size={16} />
    </div>
  );
}
