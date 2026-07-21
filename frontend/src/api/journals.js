import { fetchWithAuth } from './apiClient';

export const getJournals = async () => {
  return fetchWithAuth('/api/journals');
};

export const createJournal = async (journalData) => {
  return fetchWithAuth('/api/journals', {
    method: 'POST',
    body: JSON.stringify(journalData)
  });
};
