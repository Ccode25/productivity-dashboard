import { useState, useEffect, useMemo } from 'react';
import { groupLogsByDay, generateJournalLog } from '../utils/history';

/**
 * ViewModel hook for History logs dynamic grouping, journal text synthesis, and clipboard export.
 */
export function useHistoryLogs(history = []) {
  const [selectedDate, setSelectedDate] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const groupedHistory = useMemo(() => groupLogsByDay(history), [history]);
  const availableDates = useMemo(() => groupedHistory.map(([dateStr]) => dateStr), [groupedHistory]);

  useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !availableDates.includes(selectedDate))) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const currentJournalText = useMemo(
    () => generateJournalLog(selectedDate, history),
    [selectedDate, history]
  );

  const handleCopyJournal = () => {
    if (!currentJournalText) return;
    navigator.clipboard.writeText(currentJournalText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return {
    groupedHistory,
    availableDates,
    selectedDate,
    setSelectedDate,
    currentJournalText,
    handleCopyJournal,
    copySuccess
  };
}

export default useHistoryLogs;
