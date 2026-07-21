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

module.exports = {
  getJournals,
  createJournal
};
