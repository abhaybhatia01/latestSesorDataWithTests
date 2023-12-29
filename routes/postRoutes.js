const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares');
const PostController = require('../controllers/postController');

router.post('/', authenticate, PostController.createPost);
router.get('/', PostController.getAllPosts);
router.get('/user', authenticate, PostController.getAllPostsByUser);
router.get('/:postId', PostController.getPostById);
router.put('/:postId', authenticate, PostController.updatePost);
router.delete('/:postId', authenticate, PostController.deletePost);

module.exports = router;
