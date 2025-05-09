import React, { useEffect, useState } from "react";
import axios from "axios";
// import DisplayBlogs from "./DisplayBlogs";
import { Link } from "react-router-dom";
import { formatDate } from "../Utils/formateDate";
// import { handleSaveBlogClick } from "../Pages/BlogPage";
import { useSelector, useDispatch } from "react-redux";
import { changeLikes, changeSaves } from "../Utils/SelectedBlogSlice";
import toast from "react-hot-toast";

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const { id: userId, token } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  async function fetchBlogs() {
    try {
      let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
      setBlogs(res.data.blogs);
    } catch (error) {
      toast.error("Error fetching blogs");
    }
  }

  async function handleLike(blogId, e) {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to like blogs");
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(changeLikes(userId));
      toast.success(res.data.message);
      // Refetch blogs to update the UI
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error liking blog");
    }
  }

  async function handleSave(blogId, e) {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to save blogs");
      return;
    }
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/save-blog/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(changeSaves(blogId));
      toast.success(res.data.message);
      // Refetch blogs to update the UI
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving blog");
    }
  }

  // console.log(import.meta.env.VITE_BACKEND_URL)

  useEffect(() => {
    fetchBlogs();
  }, []);
  console.log(blogs)

  return (
    <div className="w-[70%] mx-auto">
      {blogs.map((blog, index) => (
       console.log(blog.likes?.includes(userId)),

        <Link key={index} to={"blog/" + blog.blogId}>
          <div
            key={blog._id}
            className=" w-full my-10 flex justify-between gap-2"
          >
            <div className="w-[60%] flex flex-col ">
              <div>
                {/* <img src="" alt="" /> */}
                <p className="capitalize">{blog.creator.name}</p>
              </div>
              <h2 className="font-bold text-3xl capitalize">{blog.title}</h2>
              <h4 className="line-clamp-2 capitalize">{blog.description}</h4>
              <div className="flex gap-5">
                <p>{formatDate(blog.createdAt)}</p>

                <div className='flex gap-7 '>
                  <div 
                    className='flex gap-2 items-center cursor-pointer hover:scale-110 transition-transform' 
                    onClick={(e) => handleLike(blog._id, e)}
                  >
                    {blog.likes?.includes(userId) ? (
                      <i className="fi fi-rs-heart text-red-500 text-2xl"></i>
                    ) : (
                      <i className="fi fi-ss-heart text-black text-2xl hover:text-red-500 transition-colors"></i>
                    )
                    }
              
                    <p className='text-xl'>{blog.likes?.length || 0}</p>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <i className="fi fi-sr-comment-alt text-2xl"></i>
                    <p className='text-xl'>{blog.comments?.length || 0}</p>
                  </div>
                  <div 
                    className='flex gap-2 items-center cursor-pointer hover:scale-110 transition-transform' 
                    onClick={(e) => handleSave(blog._id, e)}
                  >
                    {blog.totalSaves?.includes(userId) ? (
                      <i className="fi fi-sr-bookmark text-2xl text-blue-500"></i>
                    ) : (
                      <i className="fi fi-rr-bookmark text-2xl hover:text-blue-500 transition-colors"></i>
                    )}
                    <p className='text-xl'>{blog.totalSaves?.length || 0}</p>
                  </div>
                </div>

              </div>
            </div>
            <div className="w-[30%]">
              <img src={blog.image} alt="" className="w-full h-full object-cover rounded-lg" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
