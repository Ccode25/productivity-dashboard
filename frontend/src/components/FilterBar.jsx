import React from 'react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode
}) {
  return (
    <div className="controls-bar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* View Switcher Tabs row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Workspace Views
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { mode: 'board', label: 'Tasks Board', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg> },
            { mode: 'daily', label: 'Daily Reflection', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
            { mode: 'productivity', label: 'Productivity Metrics', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
            { mode: 'history', label: 'Activity Logs', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> }
          ].map(({ mode, label, icon }) => (
            <button
              key={mode}
              className={`tab-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: viewMode === mode ? 'hsl(var(--primary) / 0.15)' : 'transparent',
                color: viewMode === mode ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                border: viewMode === mode ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters row (only visible in task list / board / daily views) */}
      {(viewMode === 'board' || viewMode === 'daily') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="input-field search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <div className="form-group">
            <span className="form-label">Status Filter</span>
            <div className="tabs-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem', width: '100%', background: 'rgba(255,255,255,0.02)' }}>
              {['all', 'active', 'completed'].map((status) => (
                <button
                  key={status}
                  className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                  style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem', borderRadius: '6px' }}
                >
                  {status === 'all' ? 'All' : status === 'active' ? 'Pending' : 'Done'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <span className="form-label">Category Filter</span>
            <select
              className="input-field"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              {['All', 'Work', 'Personal', 'Design', 'Health', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
