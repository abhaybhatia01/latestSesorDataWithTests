const Post = require('../models/Post');

const createPost = async (req, res) => {
  try {
    const { contentText } = req.body;
    const userId = req.sessionData.userId;

    // Create a new post
    const post = new Post({ user: userId, contentText });
    const savedPost = await post.save();

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' ,error:error});
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.sessionData.userId;
    const { contentText } = req.body;

    if (!postId || !contentText) {
      return res.status(400).json({ message: "bad request" });
    }
      // Find the post by ID
    const existingPost = await Post.findById(postId);

    // Check if the post exists
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
 
    if (existingPost.user.toString() !== userId.toString()) {
        return res.status(400).json({ message: "not authorized" });
      }
    // Update the contentText
    existingPost.contentText = contentText;

    // Save the updated post
    const updatedPost = await existingPost.save();
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' , error:error});
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.sessionData.userId;

    const existingPost = await Post.findById(postId);

    // Check if the post exists
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
 
    if (existingPost.user.toString() !== userId.toString()) {
        return res.status(400).json({ message: "not authorized" });
    }

    // Delete the post
    const deletedPost = await existingPost.deleteOne();

    // Check if the deletion was successful
    if (!deletedPost || deletedPost.deletedCount === 0) {
      return res.status(500).json({ message: 'Failed to delete the post' });
    }
    
    res.json({ message: 'Post deleted successfully',deletedPost });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getAllPostsByUser = async (req, res) => {
    try {
      const userId = req.sessionData.userId;
  
      // Retrieve all posts of a single user
      const posts = await Post.find({ user: userId });
  
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

// Export post functions
module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getAllPostsByUser
};
