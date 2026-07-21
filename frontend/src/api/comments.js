import { fetchWithAuth } from './apiClient';

export const getComments = async (taskId) => {
  return fetchWithAuth(`/api/todos/${taskId}/comments`);
};

export const createComment = async (taskId, commentData) => {
  return fetchWithAuth(`/api/todos/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
};
