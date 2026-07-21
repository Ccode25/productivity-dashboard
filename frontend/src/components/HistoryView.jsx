import React from 'react';
import useHistoryLogs from '../hooks/useHistoryLogs';
import HeaderArea from './history/HeaderArea';
import EmptyState from './history/EmptyState';
import TimelineFeed from './history/TimelineFeed';
import JournalCompiler from './history/JournalCompiler';

/**
 * Main Export View Component (Container View)
 * Integrates ViewModel hook (useHistoryLogs) with presentation sub-components.
 */
export default function HistoryView({ history = [], onClearHistory }) {
  const {
    groupedHistory,
    availableDates,
    selectedDate,
    setSelectedDate,
    currentJournalText,
    handleCopyJournal,
    copySuccess
  } = useHistoryLogs(history);

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
