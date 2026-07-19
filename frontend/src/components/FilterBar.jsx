import React from 'react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) {
  return (
    <div className="glass-panel controls-bar">
      <div className="search-wrapper">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="input-field search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="filters-wrapper">
        <div className="tabs-container">
          {['all', 'active', 'completed'].map((status) => (
            <button
              key={status}
              className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status === 'active' ? 'Pending' : 'Completed'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="form-label" style={{ fontSize: '0.8rem' }}>Category:</span>
          <select
            className="input-field"
            style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {['All', 'Work', 'Personal', 'Design', 'Health', 'Other'].map((c) => (
              <option key={c} value={c}>{c}{c !== 'All' && ' Categories'}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
