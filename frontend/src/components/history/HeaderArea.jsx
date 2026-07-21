import React from 'react';

/**
 * Header view component for activity history.
 */
export default function HeaderArea({ onClearHistory, showClear }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Site Activity & Correspondence Log</h2>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0' }}>
          Daily-grouped transmittals, RFI logs, submittal approvals, and revisions for documentation audit.
        </p>
      </div>
      {showClear && (
        <button 
          className="btn btn-secondary" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.8rem', 
            padding: '0.5rem 1rem', 
            borderColor: 'rgba(239, 68, 68, 0.2)',
            color: 'hsl(var(--danger))'
          }} 
          onClick={onClearHistory}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear Audit Trail
        </button>
      )}
    </div>
  );
}
