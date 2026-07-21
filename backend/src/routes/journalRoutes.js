const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.get('/', journalController.getJournals);
router.post('/', journalController.createJournal);
router.delete('/:id', journalController.deleteJournal);

module.exports = router;
