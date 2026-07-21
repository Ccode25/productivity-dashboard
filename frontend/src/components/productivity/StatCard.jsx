import React from 'react';

/**
 * Reusable KPI analytics card presenter component.
 */
export default function StatCard({ val, label, color, bg, children }) {
  return (
    <div className="analytics-stat-card glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div 
        className="stat-icon-wrapper" 
        style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: bg, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: color 
        }}
      >
        {children}
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{val}</h4>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>{label}</p>
      </div>
    </div>
  );
}
