import React from 'react';

/**
 * Category Allocations statistics list presenter component.
 */
export default function CategoryAllocations({ categories, categoryStats, completed }) {
  return (
    <div className="chart-card glass-panel" style={{ padding: '1.5rem 2rem' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Allocations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {categories.map((cat) => {
          const count = categoryStats[cat] || 0;
          const pct = completed > 0 ? Math.round((count / completed) * 100) : 0;
          const colorVar = `--color-${cat.toLowerCase()}`;

          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span style={{ color: 'white' }}>{cat}</span>
                <span style={{ color: `hsl(var(${colorVar}))` }}>{count} ({pct}%)</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${pct}%`,
                    background: `hsl(var(${colorVar}))`,
                    boxShadow: `0 0 8px hsl(var(${colorVar}) / 0.4)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
