import React, { useState } from 'react';
import { formatDayHeader } from '../../utils/date';
import TimelineItem from './TimelineItem';

/**
 * Grouped activity feed list by day presenter component.
 */
export default function TimelineFeed({ groupedHistory }) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  // toggledDays stores explicit user overrides: true = collapsed, false = expanded
  const [toggledDays, setToggledDays] = useState({});

  const toggleDay = (dateStr) => {
    setToggledDays(prev => {
      const currentlyCollapsed = prev[dateStr] !== undefined ? prev[dateStr] : dateStr !== todayStr;
      return { ...prev, [dateStr]: !currentlyCollapsed };
    });
  };

  return (
    <div className="timeline-grouped-feed" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {groupedHistory.map(([dateStr, logs]) => {
        const isCollapsed = toggledDays[dateStr] !== undefined ? toggledDays[dateStr] : dateStr !== todayStr;
        
        return (
          <div key={dateStr} className="daily-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <h3 
            className="timeline-day-header" 
            style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => toggleDay(dateStr)}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
            {formatDayHeader(dateStr)}
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
              {isCollapsed ? '▼ Show' : '▲ Hide'}
            </span>
          </h3>

          {!isCollapsed && (
            <div style={{ position: 'relative', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '3px', width: '2px', background: 'rgba(255,255,255,0.03)' }} />

              {logs.map((log) => (
                <TimelineItem 
                  key={log.id} 
                  log={log} 
                />
              ))}
            </div>
          )}

        </div>
        );
      })}
    </div>
  );
}
