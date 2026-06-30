import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../Hooks/usePagination";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function SearchBlogs() {
  const [searchParams] = useSearchParams();
  const { tag } = useParams();
  const [page, setPage] = useState(1);

  const q = searchParams.get("q");

  const query = tag
    ? { tag: tag.toLowerCase().replace(" ", "-") }
    : { search: q };

  const { blogs, hasMore } = usePagination("search-blogs", query, 1, page);

  return (
    <div
      className="w-full bg-[#faf7f2] min-h-screen"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#c84b31]/10 flex items-center justify-center">
              <Search size={16} className="text-[#c84b31]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8a7e70]">
              Search results
            </span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold font-serif text-[#1e1b18]">
            {tag ? (
              <>
                Stories tagged{" "}
                <span className="text-[#c84b31]">#{tag}</span>
              </>
            ) : (
              <>
                Results for{" "}
                <span className="text-[#c84b31]">"{q}"</span>
              </>
            )}
          </h1>
          <div className="h-px bg-[#e5dfd3] mt-6" />
        </motion.div>

        {/* Results Grid */}
        {blogs.length > 0 && <DisplayBlogs blogs={blogs} />}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-[#1e1b18] hover:bg-[#c84b31] text-white font-bold text-[13px] px-8 py-3 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              Load more stories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBlogs;