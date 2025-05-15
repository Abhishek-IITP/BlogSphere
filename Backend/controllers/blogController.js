const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const {uploadImage , deleteImageFromCloudinary} = require("../Utils/uploadImage");
const ShortUniqueId= require('short-unique-id')
const {randomUUID}= new ShortUniqueId({length:10})

async function createBlogs(req, res) {
  
  try {
    const creator = req.user;
    const { title, description  } = req.body;
    const draft = req.body.draft == "false" ? false : true;
    const {image ,images } = req.files;
    // console.log("image:", image)

    const content= JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);

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

    const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`
  );

    // const blogId= title.toLowerCase().join("-")+"-"+ randomUUID()
    const blogId = title.toLowerCase().split(" ").join("-") + "-" + randomUUID();
// title.toLowerCase().replace(/ +/g, '-')
    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,
      tags,
    });
    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });
    
    if (draft) {
      return res.status(200).json({
        message: "Blog Saved as Draft. You can public it from your profile",
        blog,
      });
    }
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const blogs = await Blog.find(
      { draft: false }
    )
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "likes",
        select: "email name",
      })      
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


      const totalBlogs = await Blog.countDocuments({ draft: false });

    return res.status(200).json({
      message: "Blogs Fetched Successfully",
      blogs,
      hasMore: skip + limit < totalBlogs,
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
        select: "name email username profilePicture",
      },
    }).populate({
      path :"creator",
      select:"name email followers username profilePicture"
    }).lean();

    async function populateReplies(comments) {
      for (const comment of comments) {
        let populatedComment = await Comment.findById(comment._id)
          .populate({
            path: "replies",
            populate: {
              path: "user",
              select: "name email username profilePicture",
            },
          })
          .lean();

        comment.replies = populatedComment.replies;

        if (comment.replies && comment.replies.length > 0) {
          await populateReplies(comment.replies);
        }
      }
      return comments;
    }
    blog.comments = await populateReplies(blog.comments);

    if (!blog) {
      return res.status(404).json({
        message: "Blog Not found",
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

    const { title, description } = req.body;
    const draft = req.body.draft == "false" ? false : true;
    

    const content = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);
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


    let imagesToDelete = blog.content.blocks
      .filter((block) => block.type == "image")
      .filter(
        (block) => !existingImages.find(({ url }) => url == block.data.file.url)
      )
      .map((block) => block.data.file.imageId);

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
    if (req?.files?.image) {
      await deleteImageFromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${req?.files?.image[0]?.buffer?.toString(
          "base64"
        )}`
      );
      blog.image = secure_url;
      blog.imageId = public_id;
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.draft = draft;
    blog.content= content || blog.content;
    blog.tags = tags || blog.tags;
    
    await blog.save();
    
    if (draft) {
      return res.status(200).json({
        message:
          "Blog Saved as Draft. You can again public it from your profile page",
        blog,
      });
    }


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
    if (creator != blog.creator) {
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

// async function likeBlog(req, res) {
//   try {
//     const user = req.user;
//     const { id } = req.params;

//     const blog = await Blog.findById(id);

//     if (!blog) {
//       return res.status(500).json({
//         message: "Blog is not found",
//       });
//     }

//     if (!blog.likes.includes(user)) {
//       await Blog.findByIdAndUpdate(id, { $push: { likes: user } });
//       await User.findByIdAndUpdate(user, { $push: { likeBlogs: id } });
//       return res.status(200).json({
//         success: true,
//         message: "Blog Liked successfully",
//         isLiked: true,
//       });
//     } else {
//       await Blog.findByIdAndUpdate(id, { $pull: { likes: user } });
//       await User.findByIdAndUpdate(user, { $pull: { likeBlogs: id } });
//       return res.status(200).json({
//         success: true,
//         message: "Blog DisLiked successfully",
//         isLiked: false,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// }

// Funtion to save blogs
 /**4 */
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


async function searchBlogs(req, res) {
  try {
    const { search, tag } = req.query;

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    let query;

    if (tag) {
      query = { tags: tag };
    } else {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const blogs = await Blog.find(query, { draft: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "creator",
        select: "name email followers username profilePicture",
      });
    if (blogs.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Make sure all words are spelled correctly.Try different keywords . Try more general keywords",
        hasMore: false,
      });
    }

    const totalBlogs = await Blog.countDocuments(query, { draft: false });

    return res.status(200).json({
      success: true,
      blogs,
      hasMore: skip + limit < totalBlogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}




module.exports = {
  createBlogs,
  deleteBlogs,
  getBlogs,
  getBlogsById,
  updateBlogs,
  likeBlog,
  saveBlog,
  searchBlogs,
};
