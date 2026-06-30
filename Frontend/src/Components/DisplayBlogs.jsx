import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../Utils/formateDate";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { handleSaveBlogs } from "../Pages/BlogPage";
import { Heart, MessageCircle, Bookmark } from "lucide-react";

function DisplayBlogs({ blogs }) {
  const { token, id: userId } = useSelector((state) => state.user);

  return (
    <div className="flex flex-col gap-0">
      {blogs.length > 0 ? (
        blogs.map((blog, index) => (
          <motion.div
            key={blog._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            <Link
              to={`/blog/${blog.blogId}`}
              className="group block py-6 border-b border-[#e5dfd3]/60 last:border-b-0"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  {/* Category Tag (Alder & Co. style — above title) */}
                  {blog?.tags?.[0] && (
                    <span className="text-[9.5px] font-bold uppercase tracking-widest bg-[#c84b31]/8 text-[#c84b31] px-2.5 py-0.5 rounded-full w-fit mb-2">
                      {blog.tags[0]}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-[16px] md:text-[18px] font-bold text-[#1e1b18] font-serif leading-snug group-hover:text-[#c84b31] transition-colors duration-300 line-clamp-2 mb-1.5">
                    {blog?.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[12.5px] text-[#8a7e70] leading-relaxed line-clamp-2 mb-3">
                    {blog?.description}
                  </p>

                  {/* Author + Date + Interactions */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/@${blog.creator?.username}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-[#e5dfd3]">
                          <img
                            src={
                              blog?.creator?.profilePicture ||
                              `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                            }
                            alt="author"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <span className="text-[11px] font-bold text-[#5a4e40]">
                        {blog?.creator?.name}
                      </span>
                      <span className="text-[10px] text-[#a09890]">
                        · {formatDate(blog?.createdAt)}
                      </span>
                    </div>

                    {/* Interaction Icons */}
                    <div className="flex items-center gap-3 text-[#a09890]">
                      <div className="flex items-center gap-1">
                        {blog?.likes?.includes(userId) ? (
                          <Heart
                            size={12}
                            className="text-red-500 fill-red-500"
                          />
                        ) : (
                          <Heart size={12} />
                        )}
                        <span className="text-[10px] font-bold">
                          {blog?.likes?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        <span className="text-[10px] font-bold">
                          {blog?.comments?.length || 0}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSaveBlogs(blog?._id, token);
                        }}
                        className="cursor-pointer hover:text-[#c84b31] transition-colors"
                      >
                        {blog?.totalSaves?.includes(userId) ? (
                          <Bookmark
                            size={12}
                            className="text-[#c84b31] fill-[#c84b31]"
                          />
                        ) : (
                          <Bookmark size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Image (right side) */}
                <div className="sm:w-[180px] sm:min-w-[180px] h-[130px] sm:h-[140px] rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={blog?.image}
                    alt={blog?.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-[#f0ebe3] flex items-center justify-center mb-3">
            <span className="text-[20px]">✎</span>
          </div>
          <p className="text-[16px] font-serif text-[#5a4e40] font-bold">
            No stories found
          </p>
          <p className="text-[12px] text-[#a09890] mt-1">
            Check back later for new content.
          </p>
        </div>
      )}
    </div>
  );
}

export default DisplayBlogs;
