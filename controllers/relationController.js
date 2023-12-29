const Relation = require('../models/Relation');
const User = require('../models/User');

const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.sessionData.userId;
    const friendId = req.params.id;

    // Check if the friend user exists
    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend user not found' });
    }

    // Check if a relation already exists
    const existingRelation = await Relation.findOne({
      $or: [
        { sender: userId, reciever: friendId },
        { sender: friendId, reciever: userId },
      ],
    });

    if (existingRelation) {
        if (existingRelation.status === 'Pending') {
          return res.status(400).json({ message: 'Friend request already sent and is pending' });
        } else if (existingRelation.status === 'Accepted') {
          return res.status(400).json({ message: 'Friend request has already been accepted' });
        }
      }

    // Create a new relation for the friend request
    const newRelation = new Relation({
      type: 'Friend',
      sender: userId,
      reciever: friendId,
      status: 'Pending',
    });

    await newRelation.save();

    res.status(200).json({ message: 'Friend request sent successfully' ,relationId:newRelation._id});
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const acceptFriendRequest = async (req, res) => {
    try {
      const userId = req.sessionData.userId;
      const friendRequestId = req.params.id;
  
      // Check if the friend request exists
      const friendRequest = await Relation.findById(friendRequestId);
  
      if (!friendRequest || friendRequest.type !== 'Friend' || friendRequest.reciever.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Friend request not found or not applicable' });
      }
  
      if (friendRequest.status !== 'Accepted') {
        return res.status(400).json({ message: 'Friend request has already been accepted' });
      }
      // Update the friend request status to 'Accepted'
      friendRequest.status = 'Accepted';
      await friendRequest.save();
  
      res.status(200).json({ message: 'Friend request accepted successfully', relation:friendRequest });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
  };