// deleteUserUtils.js

const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Session = require('./models/Session');
const Relation = require('./models/Relation');

async function deleteUserWithItsData(userId) {
 
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if(!userId){
      throw new Error('UserId not found');
    }
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found');
    }
    const removedUser = await user.remove({ session });

    const posts = await Post.find({user:userId})

    const batchSize = 100; // Choose an appropriate batch size

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const postIds = batch.map(post => post._id);

      await Post.deleteMany({ _id: { $in: postIds } }, { session });
    }

    // Delete user's relations
    await Relation.deleteMany({ $or: [{ sender: userId }, { reciever: userId }] }, { session });

    // Delete associated sessions
    await Session.deleteMany({ userId: userId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  deleteUserWithItsData,
};
