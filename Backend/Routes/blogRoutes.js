const express = require('express');
const {createBlogs , getBlogs, getBlogsById, updateBlogs, deleteBlogs,likeBlogs} = require('../controllers/blogController');
const verifyUser = require('../Middlewares/auth');
const { addComment, deleteComment, editComment, likeComment } = require('../controllers/commentController');

const route= express.Router();

route.post("/blogs", verifyUser ,createBlogs);

route.get("/blogs",getBlogs );

route.get("/blogs/:id",getBlogsById);

route.patch("/blogs/:id",verifyUser,updateBlogs);

route.delete("/blogs/:id",verifyUser, deleteBlogs);


route.post("/blogs/like/:id",verifyUser, likeBlogs);

route.post("/blogs/comment/:id",verifyUser, addComment);

route.delete("/blogs/comment/:id",verifyUser, deleteComment);

route.patch("/blogs/edit-comment/:id",verifyUser, editComment);


route.patch("/blogs/like-comment/:id",verifyUser, likeComment);


module.exports=route
