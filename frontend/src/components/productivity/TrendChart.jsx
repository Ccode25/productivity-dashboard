import React from 'react';

/**
 * Weekly Trend Bar Chart presenter component.
 */
export default function TrendChart({ trendData }) {
  const maxCompletions = Math.max(...trendData.map((d) => d.count), 1);
  return (
    <div className="chart-card glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>7-Day Completion Trend</h3>
      <div className="bar-chart-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', height: '160px', paddingBottom: '0.5rem', position: 'relative' }}>
        {trendData.map((d, index) => {
          const heightPercent = (d.count / maxCompletions) * 100;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'end' }}>
              <div className="chart-bar-wrapper" style={{ position: 'relative', width: '60%', display: 'flex', justifyContent: 'center' }}>
                <div 
                  className="chart-bar-fill" 
                  style={{ 
                    height: `${Math.max(heightPercent, 4)}%`,
                    width: '18px',
                    borderRadius: '6px 6px 0 0',
                    background: d.count > 0 ? 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--accent) / 0.5) 100%)' : 'rgba(255,255,255,0.03)',
                    transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer'
                  }}
                  title={`${d.count} completed on ${d.formatted}`}
                />
                {d.count > 0 && (
                  <span className="bar-value-label" style={{ position: 'absolute', top: '-18px', fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
                    {d.count}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontWeight: 500 }}>
                {d.dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
