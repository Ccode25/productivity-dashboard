import React from 'react';
import { formatTime } from '../../utils/date';
import { ACTION_CONFIG, DEFAULT_ACTION_STYLE } from '../ActionConfig';

/**
 * Individual timeline entry item presenter component.
 */
export default function TimelineItem({ log }) {
  const styles = ACTION_CONFIG[log.action] || DEFAULT_ACTION_STYLE;
  const categoryLower = log.category ? log.category.toLowerCase() : 'other';
  const categoryColor = `hsl(var(--color-${categoryLower}))`;

  return (
    <div 
      className="timeline-item glass-panel" 
      style={{ 
        display: 'flex', 
        alignItems: 'start', 
        padding: '1rem', 
        position: 'relative',
        background: 'rgba(255,255,255,0.01)',
      }}
    >
      <div 
        className="timeline-node"
        style={{ 
          position: 'absolute', 
          left: '-12.5px', 
          top: '18px', 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          background: 'hsl(var(--bg-dark))', 
          border: `2px solid ${styles.color}`,
          boxShadow: `0 0 6px ${styles.color}40`,
          zIndex: 2
        }}
      />

      <div 
        style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: '6px', 
          background: styles.bg, 
          color: styles.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          flexShrink: 0
        }}
      >
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={styles.strokeWidth || 2.5}
        >
          {styles.icon}
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {log.todoTitle}
          </h4>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
            {formatTime(log.timestamp)}
          </span>
        </div>

        <p style={{ margin: '0.25rem 0 0.4rem 0', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
          {log.details}
        </p>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span 
            style={{ 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              color: styles.color, 
              background: styles.bg,
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              letterSpacing: '0.02em'
            }}
          >
            {styles.label}
          </span>
          <span 
            style={{ 
              fontSize: '0.65rem', 
              fontWeight: 600, 
              color: categoryColor, 
              background: `hsl(var(--color-${categoryLower}-hover) / 0.1)`,
              padding: '0.1rem 0.4rem',
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
}
