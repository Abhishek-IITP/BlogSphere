const express = require('express');
const {createUser , getAllUsers, deleteUser, updateUser, getAllUsersById, login,  googleAuth , verifyEmail,followUser, changeSavedLikedBlog} = require('../controllers/userController');
const verifyUser = require('../Middlewares/auth');
// const User= require('../models/userSchema')
const upload = require("../Utils/multer");
const route= express.Router();



route.post("/signup", createUser )
route.post("/signin", login )
route.get("/verify-email/:verificationToken" ,verifyEmail)

// googleAuth
route.post("/google-auth", googleAuth)

route.get("/users",getAllUsers);

route.get("/users/:username",getAllUsersById);

route.patch("/users/:id",verifyUser,upload.single("profilePicture"),updateUser);

route.delete("/users/:id",verifyUser, deleteUser);



route.patch("/follow/:id", verifyUser, followUser);

route.patch("/change-saved-liked-blog-visibility" , verifyUser , changeSavedLikedBlog)


module.exports=route
