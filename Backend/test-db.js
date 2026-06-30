const mongoose = require("mongoose");
const dbConnect = require("./Config/dbConnect");
const Blog = require("./models/blogSchema");

async function checkLatestBlog() {
  await dbConnect();
  try {
    const latestBlog = await Blog.findOne().sort({ createdAt: -1 });
    if (!latestBlog) {
      console.log("No blogs found in DB");
    } else {
      console.log("--- Latest Blog Content ---");
      console.log("Title:", latestBlog.title);
      console.log("Blocks:", JSON.stringify(latestBlog.content.blocks, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

checkLatestBlog();
