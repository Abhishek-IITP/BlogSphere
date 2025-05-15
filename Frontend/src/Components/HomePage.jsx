import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../Hooks/usePagination";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function HomePage() {
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);
  const { token } = useSelector((state) => state.user);

  const { blogs, hasMore, isLoading } = usePagination("blogs", {}, 4, page);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore]);

  return (
    <div className="w-full max-w-screen-xl mx-auto pt-6 px-4 md:px-6 flex flex-col md:flex-row gap-10">
      {/* Blog Section */}
      <div className="w-full md:w-[72%]">
        {!isLoading && blogs.length > 0 && <DisplayBlogs blogs={blogs} />}

        {/* Loader when loading more */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-10">
            <span className="loader" />
          </div>
        )}

        {/* Initial loader */}
        {isLoading && blogs.length === 0 && (
          <div className="flex justify-center py-20">
            <span className="loader scale-[1.2]" />
          </div>
        )}
      </div>

      {/* Sidebar Section */}
      <div className="w-full md:w-[28%] border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <h1 className="text-xl font-semibold text-gray-700 mb-6">
            Trending Topics
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
            {[
              "React",
              "Node js",
              "Mern",
              "Express",
              "Next.js",
              "lifestyle",
              "waterfall",
              "couplegoal",
            ].map((tag, index) => (
              <Link key={index} to={`/tag/${tag}`}>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#F3F4F6",
                    color: "#059669",
                  }}
                  className="border border-gray-300 hover:border-gray-400 rounded-full px-4 py-2 text-sm font-medium text-gray-800 flex justify-center items-center cursor-pointer transition-all duration-300"
                >
                  {tag}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
