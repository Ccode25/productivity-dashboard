const express = require('express');
const router = express.Router({ mergeParams: true }); // Important to access :taskId
const commentController = require('../controllers/commentController');

router.get('/', commentController.getComments);
router.post('/', commentController.createComment);

module.exports = router;
