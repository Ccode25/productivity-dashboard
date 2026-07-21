import { useState, useCallback } from 'react';
import * as journalsApi from '../api/journals';

export const useJournals = (addToast, user) => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await journalsApi.getJournals();
      setJournals(data);
      setError(null);
    } catch (err) {
      setError('Could not connect to journal server.');
      addToast('Failed to load journals', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  const create = async (journalData) => {
    try {
      const newJournal = await journalsApi.createJournal(journalData);
      setJournals(prev => [newJournal, ...prev]);
      addToast('Journal entry saved successfully!', 'success');
      return newJournal;
    } catch (err) {
      addToast('Failed to save journal', 'error');
      throw err;
    }
  };

  return {
    journals,
    loading,
    error,
    load,
    create
  };
};
