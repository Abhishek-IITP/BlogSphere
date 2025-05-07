const { default: mongoose } = require("mongoose");
// const { googleAuth } = require("../controllers/userController");

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: { type: String, unique: true },
    username: {
      type: String, 
      required : true,
      unique: true
    },
    password: {
      type: String, 
      unique: true
    },
    blogs : [
      {
          type:mongoose.Schema.Types.ObjectId,
          ref: "Blog",
      }
    ],
    verify:{
      type: Boolean,
      default: false,
    },

    googleAuth:{
      type : Boolean,
      default : false,
    },
    profilePicture:{
      type:String,
      default:null,
    },
    bio:{
      type: String,
    },
    followers : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    saveBlogs:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
      }
    ],
    likeBlogs : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
      }
    ],
    showLikeBlogs:{
      type: Boolean,
      default : true,
    }

  } , {timestamps : true});
  
  const User = mongoose.model("User", userSchema);
  
  module.exports=User