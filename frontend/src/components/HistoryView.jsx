import React, { useState, useEffect } from 'react';
import { formatTime, formatDayHeader } from '../utils/date';
import { groupLogsByDay, generateJournalLog } from '../utils/history';
import { ACTION_CONFIG, DEFAULT_ACTION_STYLE } from './ActionConfig';


// ==========================================================================
// SUB-COMPONENTS (View Layer)
// ==========================================================================

function HeaderArea({ onClearHistory, showClear }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Site Activity & Correspondence Log</h2>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0' }}>
          Daily-grouped transmittals, RFI logs, submittal approvals, and revisions for documentation audit.
        </p>
      </div>
      {showClear && (
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
          Clear Audit Trail
        </button>
      )}
    </div>
  );
}

function EmptyState() {
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

function TimelineItem({ log }) {
  const styles = ACTION_CONFIG[log.action] || DEFAULT_ACTION_STYLE;
  const categoryLower = log.category.toLowerCase();
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
        {styles.icon}
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

function TimelineFeed({ groupedHistory }) {
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

function JournalCompiler({
  selectedDate,
  setSelectedDate,
  availableDates,
  currentJournalText,
  handleCopyJournal,
  copySuccess
}) {
  return (
    <div className="journal-export-card glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Journal Compiler</h3>
      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', margin: '0 0 1.25rem 0' }}>
        Compile daily documentation transmittals and core logs into a clean text report for official engineering diaries.
      </p>

      {/* Select Day dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Select Log Date</label>
        <select 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '6px', 
            padding: '0.5rem', 
            color: 'white', 
            fontSize: '0.8rem',
            cursor: 'pointer',
            width: '100%',
            outline: 'none'
          }}
        >
          {availableDates.map((d) => (
            <option key={d} value={d} style={{ background: 'hsl(var(--bg-dark))', color: 'white' }}>
              {formatDayHeader(d)}
            </option>
          ))}
        </select>
      </div>

      {/* Text Report Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Formatted Site Log</label>
          <button 
            onClick={handleCopyJournal}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: copySuccess ? '#10b981' : 'hsl(var(--primary))', 
              fontSize: '0.75rem', 
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {copySuccess ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Log Text
              </>
            )}
          </button>
        </div>
        <textarea 
          value={currentJournalText}
          readOnly
          style={{ 
            width: '100%', 
            height: '240px', 
            background: 'rgba(0,0,0,0.25)', 
            border: '1px solid rgba(255,255,255,0.04)', 
            borderRadius: '8px', 
            padding: '0.75rem', 
            color: 'hsl(var(--text-secondary))', 
            fontFamily: 'monospace', 
            fontSize: '0.7rem', 
            lineHeight: '1.4', 
            resize: 'none',
            outline: 'none'
          }}
        />
      </div>

      <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', textAlign: 'center', margin: 0 }}>
        💡 Pasting this report keeps your daily RFI/Submittal transmittal records organized in emails or site dairies.
      </p>
    </div>
  );
}


// ==========================================================================
// MAIN EXPORT VIEW (MVC View Layer Component)
// ==========================================================================

export default function HistoryView({ history, onClearHistory }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const groupedHistory = groupLogsByDay(history);
  const availableDates = groupedHistory.map(([dateStr]) => dateStr);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const currentJournalText = generateJournalLog(selectedDate, history);

  const handleCopyJournal = () => {
    if (!currentJournalText) return;
    navigator.clipboard.writeText(currentJournalText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (history.length === 0) {
    return (
      <div className="history-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
        <HeaderArea onClearHistory={onClearHistory} showClear={false} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="history-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <HeaderArea onClearHistory={onClearHistory} showClear={true} />
      
      <div className="history-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        <TimelineFeed 
          groupedHistory={groupedHistory}
        />

        <JournalCompiler
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          availableDates={availableDates}
          currentJournalText={currentJournalText}
          handleCopyJournal={handleCopyJournal}
          copySuccess={copySuccess}
        />

      </div>

    </div>
  );
}
