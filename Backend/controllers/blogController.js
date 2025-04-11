const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");

async function createBlogs(req, res) {
  const creator = req.user;

  try {
    const { title, description, draft } = req.body;
    // console.log(req.body);

    if (!title || !description) {
      return res.status(400).json({
        message: "Fill all the required fields",
      });
    }

    const findUser = await User.findById(creator);
    if (!findUser) {
      return res.status(500).json({
        message: "mai ni janta bhai tujhe...tu h kon",
        success: false,
      });
    }
    // console.log(findUser)

    const blog = await Blog.create({ title, description, draft, creator });
    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });
    return res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while creating the blog",
      error: error.message,
    });
  }
}

async function getBlogs(req, res) {
  try {
    // const blogs = await Blog.find({ draft: false }).populate("creator");
    const blogs = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "likes",
        select: "email  name",
      });

    return res.status(200).json({
      message: "Blogs Fetched Successfully",
      blogs,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while fetching blogs",
      error: err.message,
    });
  }
}

async function getBlogsById(req, res) {
  try {
    const {id} = req.params;
    const blog = await Blog.findById(id).populate({
      path : "comments",
      populate:{
        path: 'user',
        select: "name email"
      }
    });
    return res.status(200).json({
      message: "Blog Fetched Successfully",
      success: true,
      blog
    })
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while fetching blogs",
      error: err.message,
    });
  }
}

async function updateBlogs(req, res) {
  try {
    const creator = req.user;
    const { id } = req.params;
    const { title, description, draft } = req.body;

    // Find the user
    const user = await User.findById(creator).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Find the blog
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found.",
        success: false,
      });
    }

    // Check if the creator of the blog matches the user trying to update it
    if (String(blog.creator) !== String(creator)) {
      return res.status(403).json({
        message: "You are not authorized to update this blog.",
        success: false,
      });
    }

    // Update only the fields that are provided in the request
    if (title) blog.title = title;
    if (description) blog.description = description;
    if (draft !== undefined) blog.draft = draft;

    // Save the updated blog
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while updating the blog",
      error: error.message,
    });
  }
}

async function deleteBlogs(req, res) {
  try {
    const { id } = req.params;
    const creator = req.user;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        message: "Blog is not Found.",
        success: false,
      });
    }
    if (!(blog.creator == creator)) {
      return res.status(403).json({
        message: "You are not authorized to delete this blog.",
        success: false,
      });
    }
    await Blog.findByIdAndDelete(id);
    await User.findByIdAndUpdate(creator, { $pull: { blogs: id } });
    return res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while deleting blog",
      error: err.message,
    });
  }
}

async function likeBlogs(req, res) {
  try {
    const { id } = req.params;
    const creator = req.user;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        message: "Blog is not Found.",
        success: false,
      });
    }
    if (!blog.likes.includes(creator)) {
      await Blog.findByIdAndUpdate(id, { $push: { likes: creator } });
      return res.status(200).json({
        success: true,
        message: "Blog Liked successfully",
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $pull: { likes: creator } });

      return res.status(400).json({
        success: false,
        message: "Blog disliked successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error occurred while Liking the blog blog",
      error: err.message,
    });
  }
}



module.exports = {
  createBlogs,
  getBlogs,
  getBlogsById, 
  updateBlogs,
  deleteBlogs,
  likeBlogs,
};
