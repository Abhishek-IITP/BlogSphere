const express = require('express');
const {createBlogs , getBlogs, getBlogsById, updateBlogs, deleteBlogs,likeBlog,saveBlog,searchBlogs,
} = require('../controllers/blogController');
const verifyUser = require('../Middlewares/auth');
const { addComment, deleteComment, editComment, likeComment } = require('../controllers/commentController');
const upload = require('../Utils/multer');

const route= express.Router();

route.post("/blogs", verifyUser, upload.fields([{name: 'image', maxCount: 1}, {name: 'images'}]) ,createBlogs);
// route.post("/blogs", verifyUser, upload.single("image"),upload.array("images") ,createBlogs);

route.get("/blogs",getBlogs );

route.get("/blogs/:blogId",getBlogsById);

route.patch("/blogs/:id",verifyUser, upload.fields([{name: 'image', maxCount: 1}, {name: 'images'}]) ,updateBlogs);

route.delete("/blogs/:id",verifyUser, deleteBlogs);


route.post("/blogs/like/:id",verifyUser, likeBlog);


route.post("/blogs/comment/:id",verifyUser, addComment);

route.delete("/blogs/comment/:id",verifyUser, deleteComment);

route.patch("/blogs/edit-comment/:id",verifyUser, editComment);


route.patch("/blogs/like-comment/:id",verifyUser, likeComment);

// SAVE BLOGS / BOOKMARK BLOGS

route.get("/search-blogs", searchBlogs)

route.patch("/save-blog/:id",verifyUser,saveBlog)


module.exports=route
