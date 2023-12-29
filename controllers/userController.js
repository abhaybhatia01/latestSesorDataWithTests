const bcrypt = require("bcrypt");
const User = require("../models/User");
const Session = require("../models/Session");
const Relation = require("../models/Relation");
const {
  generateToken,
  refreshToken,
  verifyEmail,
  VerifyPassword
} = require("../helpers");

const {deleteUserWithItsData} = require("../userTransactions")

const getAllUsers = async (req, res) => {
  try {
    // Retrieve all users
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verify input values
    const emailVerifyResult = verifyEmail(email);
    if (!emailVerifyResult.isValid) {
      return res.status(400).json({ message: emailVerifyResult.message });
    }

    const passwordVerifyResult = VerifyPassword(password);
    if (!passwordVerifyResult.isValid) {
      return res.status(400).json({ message: passwordVerifyResult.message });
    }

    // Salt and Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Register the user
    let user;
    try {
      user = new User({ email, password: hashedPassword, name });
      await user.save();
    } catch (error) {
      if (error.code == 11000) {
        return res.status(409).json({ message: "User already exists" });
      } else {
        throw error;
      }
    }

    const userId = user._id;

    // Create a session
    const token = generateToken({ userId: user._id });
    const session = new Session({ userId, token });
    await session.save();
    const sessionId = session._id;

    // Return the session token
    return res.status(200).json({ token: token ,userId:userId});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify input values
    const emailVerifyResult = verifyEmail(email);
    if (!emailVerifyResult.isValid) {
      return res.status(400).json({ message: emailVerifyResult.message });
    }

    const passwordVerifyResult = VerifyPassword(password);
    if (!passwordVerifyResult.isValid) {
      return res.status(400).json({ message: passwordVerifyResult.message });
    }

    // Verify user credentials
    const user = await User.findAndValidate(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a session
    const token = generateToken({ userId: user._id });
    const session = new Session({ userId: user._id, token });
    await session.save();
    const sessionId = session._id;

    // Return the session token
    return res
      .status(200)
      .json({ message: "Logged in", token: token , userId: user._id});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const userId = req.sessionData.userId;
    
    //Delete the user and aata
    await deleteUserWithItsData(userId);
    
    res.status(200).json({ message: "Logout and delete successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" ,error:error});
  }
};

const logOutUser = async (req, res) => {
  try {
    const token = req.headers.authorization;

    // Delete the session

    await Session.findOneAndDelete({ token: token });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" ,error:error});
  }
};

const tokenRefresh = async (req, res) => {
  try {
      const oldToken = req.body.oldToken;
      if (!oldToken) {
          return res.status(401).json({ message: 'No refresh token provided' });
      }
      const result = await refreshToken(oldToken);
      if (!result.isValid) {
          return res.status(401).json({ message: result.message });
      }
      const foundSession= await Session.findOne({token:oldToken});
      if(!foundSession){
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      foundSession.token = result.token;
      await foundSession.save();

      return res.status(200).json({message:"Token refreshed", token: result.token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const protectedRoute = async (req, res) => {
  try {
        const userId = req.sessionData.userId;

        const user = await User.findById(userId);

        res.status(200).json({message:`you are so awesome : ${user.email}`, route:"/secret"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
        const userId = req.sessionData.userId;
        const recieverId = req.params.id;

        const sender = await User.findById(userId);
        const reciever = await User.findById(recieverId);
        if(sender && reciever){
          const relation = new Relation({sender:userId, reciever:recieverId, status:"Pending",type:"Friend"} );
          await relation.save();
        }

        res.status(200).json({message:`you are so awesome : ${user.email}`, route:"/secret"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export user functions
module.exports = {
  getAllUsers,
  registerUser,
  logInUser,
  logOutUser,
  deleteUser,
  tokenRefresh,
  protectedRoute,
  sendFriendRequest,
  
};