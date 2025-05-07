const express = require('express');
const {createUser , getAllUsers, deleteUser, updateUser, getAllUsersById, login,  googleAuth , verifyEmail} = require('../controllers/userController');
const verifyUser = require('../Middlewares/auth');
// const User= require('../models/userSchema')
const route= express.Router();



route.post("/signup", createUser )
route.post("/signin", login )

route.get("/users",getAllUsers);

route.get("/users/:id",getAllUsersById);

route.patch("/users/:id",verifyUser,updateUser);

route.delete("/users/:id",verifyUser, deleteUser);


route.get("/verify-email/:verificationToken" ,verifyEmail)

// googleAuth
// route.get("/google-auth" ,googleAuth)
route.post("/google-auth", googleAuth)




module.exports=route
