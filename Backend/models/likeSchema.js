const mongoose = require ('mongoose')
const likeSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    blog:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }
  },
  {timestamps:true}
);
  
  const like = mongoose.model("like", likeSchema);

  module.exports= like;