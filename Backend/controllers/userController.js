const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const {generateJWT, verifyJWT} = require('../Utils/generateTokens');
const transporter  = require('../Utils/transporter');
const ShortUniqueId= require('short-unique-id')
const {randomUUID}= new ShortUniqueId({length:5})
const admin = require("firebase-admin");
const {getAuth} = require ("firebase-admin/auth")
const {
  deleteImageFromCloudinary,
  uploadImage,
} = require("../Utils/uploadImage");
require ('dotenv').config()
const FRONTEND_URL = process.env.FRONTEND_URL;

  admin.initializeApp({
    credential: admin.credential.cert({
      "type": process.env.FIREBASE_TYPE,
      "project_id": process.env.FIREBASE_PROJECT_ID ,
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID ,
      "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') ,
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": process.env.FIREBASE_AUTH_URI,
      "token_uri": process.env.FIREBASE_TOKEN_URI,
      "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URI,
      "client_x509_cert_url":  process.env.FIREBASE_CLIENT_X509_CERT_URL,
      "universe_domain": process.env.FIREBASE_UNIVERSAL_DOMAIN
    }
    
    )
  });


// Function to create a new user
async function createUser(req, res) {
  const { name, email, password } = req.body;

  
  try {
    if (!name || !email ) {
      return res.status(400).json({
        message: "Please provide all required fields",
        success: false,
      });
    }
    const checkForexistingUser = await User.findOne({ email });
    if (checkForexistingUser) {
      if(checkForexistingUser.googleAuth){
        return res.status(400).json({
          message: "This Email is already Registered with google. Please continue with Google",
          success: false,
  
        })
      }
      if(checkForexistingUser.isVerify){
        return res.status(400).json({
          message: "User already exists with this email",
          success: false,
        });
      }
      else{
        let verificationToken = await generateJWT({ email: checkForexistingUser.email, id: checkForexistingUser._id });
      
        const sendingMail = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: newUser.email,
          subject: "Verify your BlogSphere account",
          html: `
          <div style="font-family: 'Segoe UI', sans-serif; background: #f1f5f9; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 6px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; font-weight: 700; text-align: center;">Welcome to <span style="color: #22c55e;">BlogSphere</span>!</h2>
              <p style="font-size: 16px; color: #374151; margin-top: 24px;">
                Hey there 👋,<br/><br/>
                Thanks for signing up! Please confirm your email address by clicking the button below to activate your account.
              </p>
              <div style="text-align: center; margin: 36px 0;">
                <a href="${FRONTEND_URL}/verify-email/${verificationToken}"
                  style="background: #22c55e; color: #fff; padding: 14px 28px; font-size: 16px; border-radius: 8px; text-decoration: none; display: inline-block;">
                  Verify Your Email
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                If you didn't create a BlogSphere account, you can safely ignore this email.
              </p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
              <p style="font-size: 13px; color: #9ca3af; text-align: center;">
                — BlogSphere Team
              </p>
            </div>
          </div>
          `
        });
        

        return res.status(200).json({
          success : true,
          message : "Please Check Your Email to Verify Your Account"
        })
     
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const username = email.split("@")[0] + randomUUID();

    const newUser = await User.create({ name, email, password: hashedPassword , username });
    let verificationToken = await generateJWT({email: newUser.email , id : newUser._id })

    // EMAIL LOGIC


    const sendingMail = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: checkForexistingUser.email,
      subject: "Verify your BlogSphere account",
      html: `
      <div style="font-family: 'Segoe UI', sans-serif; background: #f1f5f9; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 6px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; font-weight: 700; text-align: center;">Welcome to <span style="color: #22c55e;">BlogSphere</span>!</h2>
          <p style="font-size: 16px; color: #374151; margin-top: 24px;">
            Hey there 👋,<br/><br/>
            Thanks for signing up! Please confirm your email address by clicking the button below to activate your account.
          </p>
          <div style="text-align: center; margin: 36px 0;">
            <a href="${FRONTEND_URL}/verify-email/${verificationToken}"
              style="background: #22c55e; color: #fff; padding: 14px 28px; font-size: 16px; border-radius: 8px; text-decoration: none; display: inline-block;">
              Verify Your Email
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            If you didn't create a BlogSphere account, you can safely ignore this email.
          </p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 13px; color: #9ca3af; text-align: center;">
            — BlogSphere Team
          </p>
        </div>
      </div>
      `
    });
    
 
    return res.status(200).json({
      message: "Please Check Your Email to Verify your Account",
      success: true,
  
    });
  } catch (err) {
    // console.log("Email sending failed:", err.message)
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

async function verifyEmail(req,res) {
  try {
    const {verificationToken} = req.params;
    const verifyToken = await verifyJWT(verificationToken);

    if(!verifyToken){
      return res.status(400).json({
        success: false,
        message: "Invalid Token/E-mail expired"
      })
    }

    const {id}= verifyToken;
    const user = await User.findByIdAndUpdate(id, {isVerify : true} , {new: true})
    
    if (!user) {
      return res.status(400).json({
        message: "User does not exist with this email",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully"
    })
  } catch (err) {
    return res.status(500).json({
      message: "Please try again",
      success: false,
    });
  }
}


async function googleAuth(req, res) {
  try {
    const { accessToken } = req.body;
    const response = await getAuth().verifyIdToken(accessToken);
    const { name, email } = response;
    let user = await User.findOne({ email });
      if (user) {
            if (user.googleAuth) {
              let token = await generateJWT({ email: user.email, id: user._id });
              return res.status(200).json({
                message: "Logged in successfully",
                success: true,
                user: {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  profilePicture: user.profilePicture,
                  username: user.username,
                  showLikedBlogs: user.showLikedBlogs,
                  showSavedBlogs: user.showSavedBlogs,
                  bio: user.bio,
                  followers: user.followers,
                  following: user.following,
                  token,
                }
              });
            } else {
              return res.status(400).json({
                message: "This Email is already Registered. Please try through Login form",
                success: true
              });
            }
          }


          const username = email.split("@")[0] + randomUUID();
          let newUser = await User.create({
            name,
            email,
            googleAuth: true,
            isVerify: true,
            username,
          });
          let token = await generateJWT({ email: newUser.email, id: newUser._id });
          return res.status(200).json({
            message: "Registered successfully",
            success: true,
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              profilePicture: newUser.profilePicture,
              username: newUser.username,
              showLikedBlogs: newUser.showLikedBlogs,
              showSavedBlogs: newUser.showSavedBlogs,
              bio: newUser.bio,
              followers: newUser.followers,
              following: newUser.following,
              token,
            }
          });

  } catch (err) {
    return res.status(500).json({
      message: "Authentication failed. Please try again.",
      success: false,
      error: err.message,
    });
  }
}


// Function to log in a user
async function login(req, res) {
  const { email, password } = req.body;

  
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
        success: false,
      });
    }
    const checkForexistingUser = await User.findOne({ email }).select(
      "password isVerify name email profilePicture username bio showLikedBlogs showSavedBlogs followers following googleAuth"
    );
    if (!checkForexistingUser) {
      return res.status(400).json({
        message: "User does not exist with this email",
        success: false,

      });
    }

    if(checkForexistingUser.googleAuth){
      return res.status(400).json({
        message: "This Email is already Registered with google. Please continue with Google",
        success: false,

      })
    }
    const checkForPass = await bcrypt.compare(password, checkForexistingUser.password); 
    if (!checkForPass) {
      return res.status(401).json({
        message: "Incorrect password",
        success: false,
      });
    }


    if (!checkForexistingUser.isVerify) {
      let verificationToken = await generateJWT({ email: checkForexistingUser.email, id: checkForexistingUser._id });
      
      const sendingMail = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: checkForexistingUser.email,
        subject: "Verify your BlogSphere account",
        html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #f1f5f9; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 6px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; font-weight: 700; text-align: center;">Welcome to <span style="color: #22c55e;">BlogSphere</span>!</h2>
            <p style="font-size: 16px; color: #374151; margin-top: 24px;">
              Hey there 👋,<br/><br/>
              Thanks for signing up! Please confirm your email address by clicking the button below to activate your account.
            </p>
            <div style="text-align: center; margin: 36px 0;">
              <a href="${FRONTEND_URL}/verify-email/${verificationToken}"
                style="background: #22c55e; color: #fff; padding: 14px 28px; font-size: 16px; border-radius: 8px; text-decoration: none; display: inline-block;">
                Verify Your Email
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              If you didn't create a BlogSphere account, you can safely ignore this email.
            </p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 13px; color: #9ca3af; text-align: center;">
              — BlogSphere Team
            </p>
          </div>
        </div>
        `
      });
      
    
      return res.status(400).json({
        message: "Please verify your email.",
        success: false,
      });
    }
    

    // Comparing the entered password with the hashed password in the database

    let token = await generateJWT({ id: checkForexistingUser._id, email: checkForexistingUser.email });
    return res.status(200).json({
      message: "Logged in successfully",
      success: true,
      user: {
        id: checkForexistingUser._id,
        name: checkForexistingUser.name,
        email: checkForexistingUser.email,
        profilePicture: checkForexistingUser.profilePicture,
        username: checkForexistingUser.username,
        bio: checkForexistingUser.bio,
        showLikedBlogs: checkForexistingUser.showLikedBlogs,
        showSavedBlogs: checkForexistingUser.showSavedBlogs,
        followers: checkForexistingUser.followers,
        following: checkForexistingUser.following,
        token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Please try again",
      success: false,
      error: err.message,
    });
  }
}

// Function to fetch all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find({});

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }

}



// Function to fetch a user by their ID
async function getAllUsersById(req, res) {
  
  try {
    const username = req.params.username;
    const user = await User.findOne({ username })
    .populate("blogs following likeBlogs saveBlogs")
    .populate({
      path: "followers following",
      select: "name username profilePicture",
    })
    .populate({
      path: "blogs likeBlogs saveBlogs",
      populate: {
        path: "creator",
        select: "name username profilePicture",
      },
    })
    .select("-password -isVerify -__v -email -googleAuth");
   
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User not found",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while fetching data",
      success: false,
      error: err.message
    });
  }
}

// Function to update a user
async function updateUser(req, res) {
  
  try {
    const id = req.params.id;
    const { name, username, bio } = req.body;
    const image = req.file;
    const user = await User.findById(id);

    if (!req.body.profilePicture) {
      if (user.profilePicId) {
        await deleteImageFromCloudinary(user.profilePicId);
      }
      user.profilePicture = null;
      user.profilePicId = null;
    }

    if (image) {
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${image.buffer.toString("base64")}`
      );

      user.profilePicture = secure_url;
      user.profilePicId = public_id;
    }

    if (user.username !== username) {
      const findUser = await User.findOne({ username });

      if (findUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }
    user.username = username;
    user.bio = bio;
    user.name = name;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: {
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio,
        username: user.username,
      },
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
  try {
    const { id } = req.params;
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
      deletedUser,
    });
  }
   catch (err) {
    return res.status(500).json({
      message: "Error occurred while deleting data",
      success: false,
    });
  }
}



async function followUser(req,res){
  try {
    const followerId = req.user;
    const { id } = req.params;


    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.followers.includes(followerId)) {
      await User.findByIdAndUpdate(id, { $set: { followers: followerId } });
      await User.findByIdAndUpdate(followerId, { $set: { following: id } });
      return res.status(200).json({
        success: true,
        message: "Followed successfully",
      });
    } else {
      await User.findByIdAndUpdate(id, { $unset: { followers: followerId } });
      await User.findByIdAndUpdate(followerId, { $unset: { following: id } });
      return res.status(200).json({
        success: true,
        message: "Unfollowed",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function changeSavedLikedBlog(req, res) {
  
  try {
    const userId = req.user;
    const { showLikedBlogs, showSavedBlogs } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({
        message: "User is not found",
      });
    }

    await User.findByIdAndUpdate(userId, { showSavedBlogs, showLikedBlogs });

    return res.status(200).json({
      success: true,
      message: "Visibilty updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}


module.exports = { createUser, getAllUsers, getAllUsersById, updateUser, deleteUser, login , verifyEmail , googleAuth , followUser,changeSavedLikedBlog };
