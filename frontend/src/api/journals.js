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

export const deleteJournal = async (id) => {
  return fetchWithAuth(`/api/journals/${id}`, {
    method: 'DELETE'
  });
};
