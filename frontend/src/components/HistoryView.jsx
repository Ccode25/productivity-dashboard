import React, { useState, useEffect } from 'react';

export default function HistoryView({ history, onClearHistory }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Time format helper inside timeline items
  const formatTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Date format helper for timeline headers
  const formatDayHeader = (dateStr) => {
    try {
      // Split YYYY-MM-DD to avoid timezone shifting
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA');
      
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      const formattedDate = d.toLocaleDateString('en-US', options);

      if (dateStr === todayStr) {
        return `Today — ${formattedDate}`;
      }
      if (dateStr === yesterdayStr) {
        return `Yesterday — ${formattedDate}`;
      }
      return formattedDate;
    } catch {
      return dateStr;
    }
  };

  // Group logs dynamically by YYYY-MM-DD date string
  const groupLogsByDay = (logs) => {
    const groups = {};
    logs.forEach((log) => {
      if (!log.timestamp) return;
      const dateStr = new Date(log.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(log);
    });
    // Return sorted entries in descending order
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const groupedHistory = groupLogsByDay(history);
  const availableDates = groupedHistory.map(([dateStr]) => dateStr);

  // Set default selected date to the most recent date with logs
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Generate Construction Log text report
  const generateJournalLog = (dateStr) => {
    if (!dateStr) return '';
    const dayLogs = history.filter((l) => {
      const logDate = new Date(l.timestamp).toLocaleDateString('en-CA');
      return logDate === dateStr;
    });

    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateDisplay = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let logText = `================================================
DAILY SITE JOURNAL LOG - ${dateStr}
================================================
Generated on: ${new Date().toLocaleDateString()}
Project Date: ${dateDisplay}
Officer: Project Documentation Engineer

------------------------------------------------
1. COMPLETED ACTIONS & SIGN-OFFS
------------------------------------------------\n`;

    const completedActions = dayLogs.filter((l) => l.action === 'completed');
    if (completedActions.length === 0) {
      logText += `  [NIL] No documents signed off or tasks completed.\n`;
    } else {
      completedActions.forEach((l) => {
        const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        logText += `  [${time}] Completed: "${l.todoTitle}" [Category: ${l.category}]\n  --> Details: ${l.details}\n\n`;
      });
    }

    logText += `------------------------------------------------
2. NEW CORRESPONDENCE & LOGGED ITEMS
------------------------------------------------\n`;

    const createdActions = dayLogs.filter((l) => l.action === 'created');
    if (createdActions.length === 0) {
      logText += `  [NIL] No new correspondence registered.\n`;
    } else {
      createdActions.forEach((l) => {
        const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        logText += `  [${time}] Registered: "${l.todoTitle}" [Category: ${l.category}]\n  --> Details: ${l.details}\n\n`;
      });
    }

    logText += `------------------------------------------------
3. MODIFICATIONS & DELETIONS
------------------------------------------------\n`;

    const otherActions = dayLogs.filter((l) => l.action !== 'completed' && l.action !== 'created');
    if (otherActions.length === 0) {
      logText += `  [NIL] No document revisions or deletions recorded.\n`;
    } else {
      otherActions.forEach((l) => {
        const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const actionLabel = l.action.toUpperCase();
        logText += `  [${time}] ${actionLabel}: "${l.todoTitle}" [Category: ${l.category}]\n  --> Details: ${l.details}\n\n`;
      });
    }

    logText += `================================================
Report Compiled via Smart Task Manager Board.
================================================`;

    return logText;
  };

  const currentJournalText = generateJournalLog(selectedDate);

  const handleCopyJournal = () => {
    if (!currentJournalText) return;
    navigator.clipboard.writeText(currentJournalText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
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
          label: 'Registered'
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
          label: 'Approved'
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
          label: 'Revision'
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
          label: 'Archived'
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
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Site Activity & Correspondence Log</h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0' }}>
            Daily-grouped transmittals, RFI logs, submittal approvals, and revisions for documentation audit.
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
            Clear Audit Trail
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
        /* Layout Grid: Left timeline, Right Export widget */
        <div className="history-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Grouped Timeline */}
          <div className="timeline-grouped-feed" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {groupedHistory.map(([dateStr, logs]) => (
              <div key={dateStr} className="daily-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Daily Group Header */}
                <h3 className="timeline-day-header" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
                  {formatDayHeader(dateStr)}
                </h3>

                {/* Sub timeline under this day */}
                <div style={{ position: 'relative', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Local axis vertical line */}
                  <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '3px', width: '2px', background: 'rgba(255,255,255,0.03)' }} />

                  {logs.map((log) => {
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
                          padding: '1rem', 
                          position: 'relative',
                          background: 'rgba(255,255,255,0.01)',
                        }}
                      >
                        {/* Dot on axis */}
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

                        {/* Status Icon Badge */}
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

                        {/* Metadata Details */}
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
                  })}
                </div>

              </div>
            ))}
          </div>

          {/* Daily Site Journal Export widget */}
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

        </div>
      )}

    </div>
  );
}
