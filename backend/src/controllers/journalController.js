const journalModel = require('../models/journalModel');

const getJournals = async (req, res) => {
  try {
    const journals = await journalModel.findAll(req.userId);
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve journals.' });
  }
};

const createJournal = async (req, res) => {
  try {
    const newJournal = await journalModel.create(req.userId, req.body);
    res.status(201).json(newJournal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal.' });
  }
};

const deleteJournal = async (req, res) => {
  try {
    console.log('Attempting to delete journal. ID:', req.params.id, 'UserID:', req.userId);
    const success = await journalModel.remove(req.userId, req.params.id);
    if (!success) {
      console.log('Delete failed. Row not found or not owned by user.');
      return res.status(404).json({ error: 'Journal not found' });
    }
    console.log('Delete successful');
    res.json({ message: 'Journal deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({ error: 'Failed to delete journal.' });
  }
};

module.exports = {
  getJournals,
  createJournal,
  deleteJournal
};
