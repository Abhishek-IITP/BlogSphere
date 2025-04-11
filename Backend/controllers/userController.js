const mongoose = require('mongoose'); 
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const {generateJWT} = require('../Utils/generateTokens');

// Function to create a new user
async function createUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password ) {
    return res.status(400).json({
      message: "Please provide all required fields",
      success: false,
    });
  }

  // let isValid = verifyJWT(token);  // Verify the token
  // if (!isValid) {
  //   return res.status(400).json({
  //     message: "Invalid token",
  //     success: false,
  //   });
  // }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    let token = await generateJWT({email: newUser.email , id : newUser._id })


    return res.status(200).json({
      message: "User created successfully",
      success: true,
      user: {
        name: newUser.name,
        email: newUser.email,
        blogs: newUser.blogs,
        token
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}


// Function to log in a user
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields",
      success: false,
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        message: "User does not exist with this email",
        success: false,

      });
    }

    // Comparing the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Incorrect password",
        success: false,
      });
    }
    const token = await generateJWT({ id: existingUser._id, email: existingUser.email });



    return res.status(200).json({
      message: "Logged in successfully",
      success: true,
      user: existingUser,
      token
    });
  } catch (err) {
    // console.error("Login error:", err); 
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

// Function to fetch all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while fetching data",
      success: false,
    });
  }
}

// Function to fetch a user by their ID
async function getAllUsersById(req, res) {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while fetching data",
      success: false,
    });
  }
}

// Function to update a user
async function updateUser(req, res) {
  const { id } = req.params;
  const { name, password, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { name, password, email }, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while updating data",
      success: false,
    });
  }
}

// Function to delete a user

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  }
   catch (err) {
    return res.status(500).json({
      message: "Error occurred while deleting data",
      success: false,
    });
  }
}

module.exports = { createUser, getAllUsers, getAllUsersById, updateUser, deleteUser, login };
