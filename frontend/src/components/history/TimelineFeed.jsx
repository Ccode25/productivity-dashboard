import React from 'react';
import { formatDayHeader } from '../../utils/date';
import TimelineItem from './TimelineItem';

/**
 * Grouped activity feed list by day presenter component.
 */
export default function TimelineFeed({ groupedHistory }) {
  return (
    <div className="timeline-grouped-feed" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {groupedHistory.map(([dateStr, logs]) => (
        <div key={dateStr} className="daily-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <h3 className="timeline-day-header" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
            {formatDayHeader(dateStr)}
          </h3>

          <div style={{ position: 'relative', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '3px', width: '2px', background: 'rgba(255,255,255,0.03)' }} />

            {logs.map((log) => (
              <TimelineItem 
                key={log.id} 
                log={log} 
              />
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}
