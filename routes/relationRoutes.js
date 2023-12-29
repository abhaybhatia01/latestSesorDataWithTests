const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares');
const RelationController = require('../controllers/relationController');

// Add this endpoint to send a friend request
router.post('/friend-request/:id', authenticate, RelationController.sendFriendRequest);
router.post('/accept-friend-request/:id', authenticate, RelationController.acceptFriendRequest);

module.exports = router;