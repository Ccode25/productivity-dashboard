import React from 'react';

/**
 * Empty State view presenter for activity history.
 */
export default function EmptyState() {
  return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem', borderStyle: 'dashed' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', marginBottom: '1rem' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <h4 style={{ margin: '0 0 0.25rem 0', color: 'white', fontWeight: 600 }}>No Activity History</h4>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
        Create, complete, edit, or delete tasks to populate the activity history timeline.
      </p>
    </div>
  );
}
