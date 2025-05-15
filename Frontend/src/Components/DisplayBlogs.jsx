import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../Utils/formateDate";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { handleSaveBlogs } from "../Pages/BlogPage";

function DisplayBlogs({ blogs }) {
  const { token, id: userId } = useSelector((state) => state.user);

  return (
    <div className="flex flex-col gap-12">
      {blogs.length > 0 ? (
        blogs.map((blog, index) => (
          <motion.div
            key={blog._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              to={`/blog/${blog.blogId}`}
              className="flex flex-col sm:flex-row justify-between group cursor-pointer"
            >
              {/* Blog Content */}
              <div className="sm:w-[65%] flex flex-col gap-3">
                {/* Author Info */}
                <div className="flex items-center gap-2">
                  <Link to={`/@${blog.creator.username}`}>
                    <div className="w-7 h-7 rounded-full overflow-hidden">
                      <img
                        src={
                          blog?.creator?.profilePicture
                            ? blog?.creator?.profilePicture
                            : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                        }
                        alt="profile"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </Link>
                  <p className="text-sm text-gray-700 group-hover:underline transition">
                    {blog?.creator?.name}
                  </p>
                </div>

                {/* Title & Description */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-black transition">
                  {blog?.title}
                </h2>
                <p className="text-gray-600 text-base line-clamp-2">
                  {blog?.description}
                </p>

                {/* Tags Section - Compact and Interactive */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {blog?.tags?.map((tag, idx) => (
                    <Link key={idx} to={`/tag/${tag}`}>
                      <div className="bg-gray-200 text-sm text-black hover:bg-blue-500 hover:text-white rounded-full px-4 py-2 transition duration-300 ease-in-out transform hover:scale-105">
                        {tag}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Footer: Date, Like, Comment, Save */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-500 mt-4">
                  <p>{formatDate(blog?.createdAt)}</p>
                  <div className="flex gap-6">
                    {/* Like (Heart) Button */}
                    <div className="flex items-center gap-1">
                      {blog?.likes?.includes(userId) ? (
                        <i className="fi fi-ss-heart text-base text-red-500"></i>
                      ) : (
                        <i className="fi fi-rs-heart text-base"></i>
                      )}
                      <span>{blog?.likes?.length}</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center cursor-pointer gap-1">
                      <i className="fi fi-sr-comment-alt text-base"></i>
                      <span>{blog?.comments?.length}</span>
                    </div>

                    {/* Save */}
                    
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveBlogs(blog?._id, token);
                      }}
                    >
                      {blog?.totalSaves?.includes(userId) ? (
                        <i className="fi fi-sr-bookmark text-base"></i>
                      ) : (
                        <i className="fi fi-rr-bookmark text-base"></i>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Image */}
              <div className="sm:w-[30%] mt-4 sm:mt-0 sm:ml-8">
                <img
                  src={blog?.image}
                  alt="blog thumbnail"
                  className="rounded-xl w-full aspect-video object-cover shadow-md group-hover:shadow-xl transition-all duration-300"
                />
              </div>
            </Link>
          </motion.div>
        ))
      ) : (
        <h1 className="text-2xl font-semibold text-center text-gray-700 py-10">
          No data found
        </h1>
      )}
    </div>
  );
}

export default DisplayBlogs;
