import React from 'react';

export default function StatsDashboard({ todos }) {
  // 1. Overall stats
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 2. Today's stats (normalized to YYYY-MM-DD local timezone split)
  const todayStr = new Date().toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD reliably
  const todayTodos = todos.filter(t => t.dueDate === todayStr);
  const todayTotal = todayTodos.length;
  const todayCompleted = todayTodos.filter(t => t.completed).length;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <div className="glass-panel stats-dashboard">
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'hsl(var(--success))' }}>{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'hsl(var(--warning))' }}>{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>
      
      <div className="progress-grid">
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-title">Overall Progress</span>
            <span className="progress-percentage">{percentage}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-title">Today's Progress</span>
            <span className="progress-percentage">
              {todayTotal > 0 ? `${todayPercentage}% (${todayCompleted}/${todayTotal})` : 'No tasks today'}
            </span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill today-fill" 
              style={{ 
                width: `${todayPercentage}%`,
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
