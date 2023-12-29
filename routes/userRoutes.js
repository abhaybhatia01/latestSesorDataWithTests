const express = require('express');
const router = express.Router();
const {authenticate} = require("../middlewares")
const userController = require("../controllers/userController")


router.get('/', userController.getAllUsers);

router.post("/register", userController.registerUser)
router.post("/login", userController.logInUser)
router.post('/token-refresh',userController.tokenRefresh);

router.get('/secret',authenticate, userController.protectedRoute);
router.post('/friend-request/:id',authenticate, userController.sendFriendRequest);


router.post('/logout',authenticate, userController.logOutUser);
router.delete('/delete',authenticate, userController.deleteUser);



module.exports = router;