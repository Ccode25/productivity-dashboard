import React from 'react';
import { formatDayHeader } from '../../utils/date';

/**
 * Journal Compiler panel presenter component.
 */
export default function JournalCompiler({
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
