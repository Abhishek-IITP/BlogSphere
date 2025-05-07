const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");


async function addComment(req, res) {
    try {
      const creator = req.user; //kon kr rha h
      const { id } = req.params; //kispe kr rha h.....blog ki id h
      const { comment } = req.body; //kya kr rha h
  
      if (!comment || comment.length <= 0) {
        return res.status(400).json({
          message: "Please enter a comment.",
          success: false,
        });
      }
  
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          message: "Blog not found.",
          success: false,
        });
      }
  
      //create comment
      const newComment = await Comment.create({ comment, blog: id, user: creator }).then((comment)=>{
        return comment.populate({
          path: "user",
          select: "name email"
        })
      })
    
      await Blog.findByIdAndUpdate(id, { $push: { comments: newComment._id } });
  
      return res.status(200).json({
        success: true,
        message: "Comment added successfully",
        newComment,
      });
  
    } catch (err) {
      return res.status(500).json({
        message: "Error occurred while commenting  blog",
        error: err.message,
      });
    }
  }
  
  async function deleteComment(req, res) {
    try {
      const userId = req.user;
      const { id } = req.params;
      
      const comment = await Comment.findById(id).populate({
        path: "blog",
        select: "creator",
      });
      //  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjUyNDNlOTM2YjQ1MmZkNjNlYThiYyIsImVtYWlsIjoiYWtrYXkyNDc3Nzc4ODJAZ21haWwuY29tIiwiaWF0IjoxNzQ0MjcyNTM5fQ.IcaaPGd45MwEfSJC_22eg4Cf4-aMho765J8Wr6tIFtg
      if (!comment) {
        return res.status(500).json({
          message: "Comment not found",
        });
      }
      console.log(comment,userId,comment.blog.creator, comment.user)
  
      if (comment.user != userId && comment.blog.creator != userId) {
        return res.status(500).json({
          message: "You are not authorized",
        });
      }
      await Blog.findByIdAndUpdate(comment.blog._id, {
        $pull: { comments: id },
      });
      await Comment.findByIdAndDelete(id);
  
      await comment.deleteOne();
  
      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
  
    } catch (err) {
      return res.status(500).json({
        message: "Error occurred while commenting  blog",
        error: err.message,
      });
    }
  }


  async function editComment(req, res) {
    try {
      const userId = req.user; //kon kr rha h
      const { id } = req.params; //kispe kr rha h... comment ki id h
      const { updateComment } = req.body; //kya kr rha h
  
        const comment = await Comment.findById(id)

        if(!comment){
            return res.status(500).json({
                message:"Comment is not found",
                success: false
            })
        }
        if(comment.user != userId){
            return res.status(400).json({
                message:"You are not a Valid user to edit this comment",
                success: false
            })
        }

        await Comment.findByIdAndUpdate(id,{comment: updateComment})


      return res.status(200).json({
        success: true,
        message: "Comment updated successfully",
      });
  
    } catch (err) {
      return res.status(500).json({
        message: "Error occurred while editing the comment ",
        error: err.message,
      });
    }
  }

  async function likeComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user;
  
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({
          message: "Comment not found.",
          success: false,
        });
      }
      if (!comment.likes.includes(userId)) {
        await Comment.findByIdAndUpdate(id, { $push: { likes: userId } });
        return res.status(200).json({
          success: true,
          message: "Comment liked successfully",
        });
    } else {
        await Comment.findByIdAndUpdate(id, { $pull: { likes: userId } });
        return res.status(200).json({
          success: true,
          message: "Comment disliked successfully",
        });
      }
    }  catch (err) {
        return res.status(500).json({
          message: "Error occurred while liking/disliking comment",
          error: err.message,
        });
      }
    }

  
  


  module.exports = {
    addComment,
    deleteComment,
    editComment,
    likeComment
  };