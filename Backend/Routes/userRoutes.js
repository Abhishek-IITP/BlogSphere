const express = require('express');
const {createUser , getAllUsers, deleteUser, updateUser, getAllUsersById, login} = require('../controllers/userController');
const User= require('../models/userSchema')
const route= express.Router();



route.post("/users", createUser )
route.post("/login", login )

route.get("/users",getAllUsers);

route.get("/users/:id",getAllUsersById);

route.patch("/users/:id",updateUser);

route.delete("/users/:id", deleteUser);




module.exports=route
