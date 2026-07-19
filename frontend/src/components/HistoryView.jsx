import React from 'react';

export default function HistoryView({ history, onClearHistory }) {
  const formatTimestamp = (isoStr) => {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Today at ${timeStr}`;
      }
      
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();
      if (isYesterday) {
        return `Yesterday at ${timeStr}`;
      }
      
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
    } catch {
      return 'Unknown date';
    }
  };

  const getActionStyles = (action) => {
    switch (action) {
      case 'created':
        return {
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ),
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          label: 'Created'
        };
      case 'completed':
        return {
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ),
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          label: 'Completed'
        };
      case 'reopened':
        return {
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          ),
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          label: 'Reopened'
        };
      case 'updated':
        return {
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          ),
          color: 'hsl(var(--primary))',
          bg: 'rgba(139, 92, 246, 0.12)',
          label: 'Updated'
        };
      case 'deleted':
        return {
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          ),
          color: 'hsl(var(--danger))',
          bg: 'rgba(239, 68, 68, 0.15)',
          label: 'Deleted'
        };
      default:
        return {
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
          ),
          color: 'hsl(var(--text-secondary))',
          bg: 'rgba(255, 255, 255, 0.05)',
          label: 'Action'
        };
    }
  };

  return (
    <div className="history-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      
      {/* Header section with Clear action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Activity & Task History</h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0' }}>
            A chronological timeline of creation, completion, modification, and deletion events.
          </p>
        </div>
        {history.length > 0 && (
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
            Clear History Logs
          </button>
        )}
      </div>

      {history.length === 0 ? (
        /* Empty State */
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
      ) : (
        /* Timeline Feed */
        <div className="timeline-container" style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Vertical axis line */}
          <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '6px', width: '2px', background: 'rgba(255,255,255,0.04)' }} />

          {history.map((log) => {
            const styles = getActionStyles(log.action);
            const categoryLower = log.category.toLowerCase();
            const categoryColor = `hsl(var(--color-${categoryLower}))`;

            return (
              <div 
                key={log.id} 
                className="timeline-item glass-panel" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'start', 
                  padding: '1.25rem', 
                  position: 'relative',
                  background: 'rgba(255,255,255,0.01)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Node Ring positioned on the axis */}
                <div 
                  className="timeline-node"
                  style={{ 
                    position: 'absolute', 
                    left: '-24px', 
                    top: '20px', 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    background: 'hsl(var(--bg-dark))', 
                    border: `2px solid ${styles.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 8px ${styles.color}40`,
                    zIndex: 2
                  }}
                />

                {/* Left Side: Status Icon Badge */}
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: styles.bg, 
                    color: styles.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    flexShrink: 0
                  }}
                >
                  {styles.icon}
                </div>

                {/* Right Side: Log Metadata & Context */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {log.todoTitle}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  <p style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                    {log.details}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        color: styles.color, 
                        background: styles.bg,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {styles.label}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 600, 
                        color: categoryColor, 
                        background: `hsl(var(--color-${categoryLower}-hover) / 0.1)`,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: `1px solid hsl(var(--color-${categoryLower}-hover) / 0.15)`
                      }}
                    >
                      {log.category}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
