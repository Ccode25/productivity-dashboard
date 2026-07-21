const commentModel = require('../models/commentModel');

const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await commentModel.findAllByTask(taskId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments.' });
  }
};

const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const data = { ...req.body, task_id: taskId };
    const newComment = await commentModel.create(req.userId, data);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment.' });
  }
};

module.exports = {
  getComments,
  createComment
};
