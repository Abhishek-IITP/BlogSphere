import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../Hooks/usePagination";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

function HomePage() {
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);
  const scrollRef = useRef(null);
  const { token } = useSelector((state) => state.user);

  const { blogs, hasMore, isLoading } = usePagination("blogs", {}, 4, page);

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

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const tags = [
    "React",
    "Node.js",
    "MERN",
    "Express",
    "Next.js",
    "Lifestyle",
    "Waterfall",
    "CoupleGoals",
    "JavaScript",
    "UI/UX",
    "Firebase",
  ];

  // Drag to scroll setup
  useEffect(() => {
    const container = scrollRef.current;
    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      container.classList.add("active");
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.classList.remove("active");
    };

    const handleMouseUp = () => {
      isDown = false;
      container.classList.remove("active");
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full max-w-screen-xl mx-auto pt-6 px-4 md:px-6">
      {/* Trending Topics Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="sticky top-7 z-10 bg-white pt-2 pb-4 border-b border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Trending Topics</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-1 rounded-full hover:bg-gray-100 transition"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={scrollRight}
              className="p-1 rounded-full hover:bg-gray-100 transition"
              aria-label="Scroll Right"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden scroll-drag scrollbar-none scroll-smooth px-1"
        >
          {tags.map((tag, index) => (
            <Link key={index} to={`/tag/${tag}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="whitespace-nowrap bg-gray-100 hover:bg-green-400 hover:text-white text-gray-800 font-semibold rounded-full px-5 py-2 text-sm shadow-sm transition-all duration-300 cursor-pointer"
              >
                #{tag}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-10 mt-6">
        {/* Blog Feed */}
        <div className="w-full mx-auto md:w-[72%]">
          {!isLoading && blogs.length > 0 && <DisplayBlogs blogs={blogs} />}

          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-10">
              <span className="loader" />
            </div>
          )}

          {isLoading && blogs.length === 0 && (
            <div className="flex justify-center py-20">
              <span className="loader scale-[1.2]" />
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

export default HomePage;
