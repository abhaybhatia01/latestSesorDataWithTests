const jwt = require('jsonwebtoken');
const Session = require("./models/Session");
const User = require("./models/User");

const secret = process.env.SECRET || "not-a-good-secret-key";


// Middleware to authenticate requests
async function authenticate(req, res, next) {
  try{
      const token = req.headers.authorization;
    
      if (!token || token === null || token === undefined) {
        return res.status(401).json({ message: 'No token provided' });
      }

    try {
      //checking token validity
      const result = jwt.verify(token, secret);
      if (!result) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      //check if user is still logged in with this user
      const session = await Session.findOne({ token: token });
      if (!session) {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }

      //checking if user still exists or not 
      const user = await User.findById(session.userId);
      if (!user) {
        const session = await Session.findByIdAndDelete(session._id);
        return res.status(401).json({ message: 'Invalid token' });
      }
      const sessionData={ userId:session.userId,email:user.email }
      //if everything is alright.
      req.sessionData = sessionData;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
    authenticate,
}

