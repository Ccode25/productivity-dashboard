import React, { useState } from 'react';
import TaskItem from './TaskItem';
import { getGroupedTodos } from '../utils/date';

export default function DailySummaryView({ todos, onToggleComplete, onEdit, onDelete }) {
  const [expandedGroups, setExpandedGroups] = useState({
    overdue: true,
    today: true,
    tomorrow: true,
  });

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key], // default to true if undefined
    }));
  };

  const grouped = getGroupedTodos(todos);

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
          No tasks match the filters for the Daily Review.
        </p>
      </div>
    );
  }

  return (
    <div className="daily-review-container">
      {grouped.map((group) => {
        const isExpanded = expandedGroups[group.key] !== false;
        const total = group.todos.length;
        const completed = group.todos.filter((t) => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const groupColorClass = group.key === 'overdue' ? 'group-overdue' : '';

        return (
          <div key={group.key} className={`daily-group-panel glass-panel ${groupColorClass}`}>
            <div className="daily-group-header" onClick={() => toggleGroup(group.key)}>
              <div className="daily-group-title-section">
                <span className={`accordion-arrow ${isExpanded ? 'expanded' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                <h3 className="daily-group-title">{group.label}</h3>
                <span className="daily-group-badge">
                  {completed}/{total} Done
                </span>
              </div>
              
              <div className="daily-group-progress-wrapper">
                <div className="micro-progress-bar-bg">
                  <div 
                    className="micro-progress-bar-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: group.key === 'overdue' ? 'hsl(var(--danger))' : 'hsl(var(--success))'
                    }}
                  />
                </div>
                <span className="micro-progress-text">{percentage}%</span>
              </div>
            </div>

            {isExpanded && (
              <div className="daily-group-content">
                <div className="daily-task-rows">
                  {group.todos.map((todo) => (
                    <TaskItem
                      key={todo.id}
                      todo={todo}
                      variant="daily"
                      onToggleComplete={onToggleComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
