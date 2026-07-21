import React, { useState } from 'react';
import { getMostImportantTask } from '../utils/triage';
import Button from './common/Button';

export default function SmartTriage({ todos, onEdit, onToggleComplete }) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  const suggestedTask = getMostImportantTask(todos);

  return (
    <div className="smart-triage-container glass-panel">
      {!showSuggestion ? (
        <div className="triage-prompt" onClick={() => setShowSuggestion(true)}>
          <span className="triage-icon">✨</span>
          <span className="triage-text">Overwhelmed? Click to see what you should do right now.</span>
        </div>
      ) : suggestedTask ? (
        <div className="triage-suggestion animate-fade-in">
          <div className="triage-header">
            <h4>Here is your priority task:</h4>
            <Button variant="icon" onClick={() => setShowSuggestion(false)} title="Hide">
              ✕
            </Button>
          </div>
          
          <div className="triage-task-card">
            <div className="triage-task-content">
              <h5>{suggestedTask.title}</h5>
              {suggestedTask.description && <p className="triage-desc">{suggestedTask.description}</p>}
              <div className="triage-meta">
                <span className={`priority-badge priority-${suggestedTask.priority || 'medium'}`}>
                  {suggestedTask.priority || 'Medium'}
                </span>
                {suggestedTask.dueDate && (
                  <span className={`date-badge ${suggestedTask.dueDate < new Date().toLocaleDateString('en-CA') ? 'overdue' : 'today'}`}>
                    Due: {suggestedTask.dueDate}
                  </span>
                )}
              </div>
            </div>
            <div className="triage-actions">
              <Button 
                variant="success" 
                onClick={() => {
                  onToggleComplete(suggestedTask.id);
                  setShowSuggestion(false);
                }}
              >
                Mark Done
              </Button>
              <Button variant="secondary" onClick={() => onEdit(suggestedTask)}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="triage-suggestion animate-fade-in">
          <div className="triage-header">
            <h4>All caught up!</h4>
            <Button variant="icon" onClick={() => setShowSuggestion(false)}>✕</Button>
          </div>
          <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '0.5rem' }}>
            You have no pending tasks right now. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
