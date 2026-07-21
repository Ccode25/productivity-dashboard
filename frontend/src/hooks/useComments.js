import { useState, useCallback } from 'react';
import * as commentsApi from '../api/comments';

export const useComments = (taskId, addToast) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await commentsApi.getComments(taskId);
      setComments(data);
    } catch (err) {
      addToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  }, [taskId, addToast]);

  const create = async (commentText) => {
    try {
      const newComment = await commentsApi.createComment(taskId, { comment_text: commentText });
      setComments(prev => [...prev, newComment]);
      addToast('Comment added', 'success');
      return newComment;
    } catch (err) {
      addToast('Failed to add comment', 'error');
      throw err;
    }
  };

  return {
    comments,
    loading,
    load,
    create
  };
};
