import React, { useEffect } from 'react';
import useHistoryLogs from '../hooks/useHistoryLogs';
import { useJournals } from '../hooks/useJournals';
import useAuth from '../hooks/useAuth';
import HeaderArea from './history/HeaderArea';
import EmptyState from './history/EmptyState';
import TimelineFeed from './history/TimelineFeed';
import ProfessionalJournalView from './history/ProfessionalJournalView';

export default function HistoryView({ history = [], onClearHistory }) {
  const { user } = useAuth();
  const { journals, load: loadJournals, create: createJournal, loading: loadingJournals } = useJournals(() => {}, user);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const {
    groupedHistory,
  } = useHistoryLogs(history);

  if (history.length === 0 && journals.length === 0) {
    return (
      <div className="history-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
        <HeaderArea onClearHistory={onClearHistory} showClear={false} />
        <ProfessionalJournalView journals={journals} onCreateJournal={createJournal} />
        <EmptyState />
      </div>
    );
  }

  // To truly combine them chronologically, we could merge `journals` into `history` arrays.
  // For now, groupedHistory handles the tasks, and ProfessionalJournalView handles the journals visually.

  return (
    <div className="history-view-container glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <HeaderArea onClearHistory={onClearHistory} showClear={true} />
      
      <div className="history-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        <TimelineFeed 
          groupedHistory={groupedHistory}
        />

        <ProfessionalJournalView 
          journals={journals} 
          onCreateJournal={createJournal} 
        />

      </div>

    </div>
  );
}
