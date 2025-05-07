const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const {uploadImage , deleteImageFromCloudinary} = require("../Utils/uploadImage");
const fs = require ("fs")
const user= require("../controllers/userController")
const uniqueId= require("uniqid")
const ShortUniqueId= require('short-unique-id')
const {randomUUID}= new ShortUniqueId({length:10})

async function createBlogs(req, res) {
  const creator = req.user;

  try {
    const { title, description, draft  } = req.body;
    // const image = req.file;
    const {image ,images } = req.files;
    // console.log({ title, description, draft, image });
    // console.log(req.body);
    const content= JSON.parse(req.body.content)
 


    if (!title || !description) {
      return res.status(400).json({
        message: "Fill all the required fields",
      });
    }
    if (!content) {
      return res.status(400).json({
        message: "Please add some content",
      });
    }

    const findUser = await User.findById(creator);
    if (!findUser) {
      return res.status(500).json({
        message: "mai ni janta bhai tujhe...tu h kon",
        success: false,
      });
    }
 

    // cloudinary
    let imageIndex =0;
    for(let i=0; i<content.blocks.length ; i++){
      const block = content.blocks[i];
      if(block.type === 'image'){

        const {secure_url , public_id} = await uploadImage(
          `data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`
        )
        block.data.file = {
          url : secure_url,
          imageId: public_id,
        }
        imageIndex++;
      }
    }

    const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${images[0].buffer.toString("base64")}`
  );

    // const blogId= title.toLowerCase().join("-")+"-"+ randomUUID()
    const blogId = title.toLowerCase().replace(/ +/g, "-") + "-" + randomUUID();

    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,

    });
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
    
    const blogs = await Blog.find(
      { draft: false }
    )
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
    const { blogId } = req.params;
    const blog = await Blog.findOne({blogId}).populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name email",
      },
    }).populate({
      path :"creator",
      select:"name email"
    })
    // const blog = await Blog.findOne({ blogId }).populate("creator", "-password");


    if(!blog){ 
    return res.status(404).json({
      message: "Blog not Found",

    });

    }

    return res.status(200).json({
      message: "Blog Fetched Successfully",
      success: true,
      blog,
    });
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

    const { title, description, draft: draftValue } = req.body;
    const draft = draftValue === "false" ? false : true;
    

    // const image = req.files;
    // console.log(image)

    const content = JSON.parse(req.body.content);
    const existingImages = JSON.parse(req.body.existingImages);

    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(500).json({
        message: "Blog is not found",
      });
    }

     // Check if the creator of the blog matches the user trying to update it
     if (!(creator == blog.creator)) {
      return res.status(403).json({ 
        message: "You are not authorized for this action",
      });
    }

    let imageToDelete= blog.content.blocks.filter((block)=> block.type == "image").filter((block)=> !existingImages.find(({url})=> url == block.data.file.url)).map((block)=> block.data.file.imageId);

    if(imageToDelete.length>0){
      await Promise.all(
        imageToDelete.map((id)=> deleteImageFromCloudinary(id))
      )
    }

    if(req.files.images){
      let imageIndex =0;
      for(let i=0; i<content.blocks.length ; i++){
        const block = content.blocks[i];
        if(block.type === 'image' && block.data.file.image){
  
          const {secure_url , public_id} = await uploadImage(
            `data:image/jpeg;base64,${req.files.images[imageIndex].buffer.toString("base64")}`
          )
          block.data.file = {
            url : secure_url,
            imageId: public_id,
          }
          imageIndex++;
        }
      }
    }



    // Find the user
    const user = await User.findById(creator).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
 
    if(req.files.image){
      await deleteImageFromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${req.files.image[0].buffer.toString("base64")}`);
      blog.image = secure_url;
      blog.imageId = public_id;

    }
    

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.draft = draft;
    blog.content= content || blog.content;
    // if (draft) {
    //   return res.status(200).json({
    //     message:
    //       "Blog Saved as Draft. You can again public it from your profile page",
    //     blog,
    //   });
    // }




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


    await deleteImageFromCloudinary(blog.imageId)

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

async function likeBlog(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(500).json({
        message: "Blog is not found",
      });
    }

    if (!blog.likes.includes(user)) {
      await Blog.findByIdAndUpdate(id, { $push: { likes: user } });
      await User.findByIdAndUpdate(user, { $push: { likeBlogs: id } });
      return res.status(200).json({
        success: true,
        message: "Blog Liked successfully",
        isLiked: true,
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $pull: { likes: user } });
      await User.findByIdAndUpdate(user, { $pull: { likeBlogs: id } });
      return res.status(200).json({
        success: true,
        message: "Blog DisLiked successfully",
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// Funtion to save blogs
async function saveBlog(req, res){
  try {
    const user = req.user;
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        message: "Blog is not found",
      });
    }

    if (!blog.totalSaves.includes(user)) {
      await Blog.findByIdAndUpdate(id, { $set: { totalSaves: user } });
      await User.findByIdAndUpdate(user, { $set: { saveBlogs: id } });
      return res.status(200).json({
        success: true,
        message: "Blog Saved successfully",
        isLiked: true,
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $unset: { totalSaves: user } });
      await User.findByIdAndUpdate(user, { $unset: { saveBlogs: id } });
      return res.status(200).json({
        success: true,
        message: "Blog Unsaved",
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}




module.exports = {
  createBlogs,
  getBlogs,
  getBlogsById,
  updateBlogs,
  deleteBlogs,
  likeBlog,
  saveBlog,
};
