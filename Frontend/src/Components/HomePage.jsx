import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDate } from "../Utils/formateDate";
// import { handleSaveBlogClick } from "../Pages/BlogPage";
import { useSelector } from "react-redux";
const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const { id: userId , token} = useSelector((state) => state.user);
  async function fetchBlogs() {
let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
    // console.log(res.data.blogs);
    setBlogs(res.data.blogs);
  }
  // console.log(import.meta.env.VITE_BACKEND_URL)

  useEffect(() => {
    fetchBlogs();
  }, []);
  console.log(blogs)
  return (
    <div className="w-[70%] mx-auto">
      {blogs.map((blogs,index) => (
        <Link key={index} to={"blog/" + blogs.blogId}>
          <div
            key={blogs._id}
            className=" w-full my-10 flex justify-between gap-2"
          >
            <div className="w-[60%] flex flex-col ">
              <div>
                {/* <img src="" alt="" /> */}
                <p className="capitalize">{blogs.creator.name}</p>
              </div>
              <h2 className="font-bold text-3xl capitalize">{blogs.title}</h2>
              <h4 className="line-clamp-2 capitalize">{blogs.description}</h4>
              <div className="flex gap-5">
                <p>{formatDate(blogs.createdAt)}</p>

                <div className='flex gap-7 '>
  <div className='flex gap-2 items-center'>
    <i className="fi fi-rs-heart mt-1 text-xl"></i>
    <p className='text-xl'>{blogs.likes.length}</p>
  </div>
  <div className='flex gap-2 items-center'>
    <i className="fi fi-sr-comment-alt mt-1 text-xl"></i>
    <p className='text-xl'>{blogs.comments.length}</p>
  </div>
  <div className='flex gap-2 items-center' onClick={(e)=>{
    e.preventDefault();
    handleSaveBlogClick(blogs._id , token)}}>

{
    blogs?.totalSaves?.includes(userId) ? 
    (<i className="fi fi-sr-bookmark cursor-pointer mt-1 text-xl"></i>) :

(<i className="fi fi-rr-bookmark cursor-pointer mt-1 text-xl"></i>)
}
<p className='text-3xl'>{200}</p>
</div>
</div>

              </div>
            </div>
            <div className="w-[30%]">
              <img src={blogs.image} alt="" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
