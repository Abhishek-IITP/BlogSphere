import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../Hooks/usePagination";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Compass,
  Heart,
  PenTool,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import LandingPage from "./LandingPage";
import { formatDate } from "../Utils/formateDate";

function HomePage() {
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);
  const { token, name, profilePicture, username, id: userId } = useSelector(
    (state) => state.user
  );
  const [activeTag, setActiveTag] = useState("All");

  const { blogs, hasMore, isLoading } = usePagination("blogs", {}, 6, page);

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

  const tags = [
    "All",
    "React",
    "Node.js",
    "MERN",
    "Express",
    "Next.js",
    "Lifestyle",
    "JavaScript",
    "UI/UX",
  ];

  if (!token) {
    return (
      <LandingPage
        blogs={blogs}
        hasMore={hasMore}
        isLoading={isLoading}
        setPage={setPage}
        loaderRef={loaderRef}
      />
    );
  }

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const feedBlogs = blogs.length > 1 ? blogs.slice(1) : [];
  const trendingList = blogs.slice(0, 4);

  return (
    <div
      className="w-full bg-[#faf7f2] min-h-screen text-[#1e1b18] pb-16"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="max-w-[1500px] mx-auto px-6 pt-8">
        {/* ─── 3-COLUMN GRID LAYOUT ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── LEFT SIDEBAR (Headway-inspired) ──────────────────── */}
          <aside className="hidden lg:block lg:col-span-2 sticky top-24 h-fit pr-2">
            {/* User Card */}
            <div className="bg-white rounded-2xl border border-[#e5dfd3]/60 p-5 mb-5 shadow-[0_1px_6px_rgba(100,80,50,0.04)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#e5dfd3]">
                  <img
                    src={
                      profilePicture ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${name}`
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold leading-tight">
                    {name}
                  </h4>
                  <p className="text-[11px] text-[#8a7e70]">
                    Writer & Creator
                  </p>
                </div>
              </div>
              <div className="h-px bg-[#e5dfd3]/60 my-4" />
              <div className="flex items-center justify-between text-[11px] text-[#8a7e70] font-bold">
                <span>MEMBERSHIP</span>
                <span className="text-[#c84b31]">FREE</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 mb-6">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#e5dfd3]/50 text-[13px] font-bold text-[#c84b31] shadow-[0_1px_4px_rgba(100,80,50,0.04)]"
              >
                <BookOpen size={15} /> Home Feed
              </Link>
              <Link
                to="/add-blog"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/70 text-[13px] font-semibold text-[#5a4e40] hover:text-[#c84b31] transition-all"
              >
                <PenTool size={15} /> Write a Story
              </Link>
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/70 text-[13px] font-semibold text-[#5a4e40] hover:text-[#c84b31] transition-all"
              >
                <Compass size={15} /> Explore Tags
              </Link>
              <Link
                to={`/@${username}/saved-blogs`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/70 text-[13px] font-semibold text-[#5a4e40] hover:text-[#c84b31] transition-all"
              >
                <Bookmark size={15} /> Saved Stories
              </Link>
            </div>

            {/* Stats Card */}
            <div className="p-4 bg-[#f0ebe3] rounded-2xl border border-[#e5dfd3]/60 text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8a7e70] block mb-1">
                Community
              </span>
              <p className="text-[12px] text-[#5a4e40] leading-relaxed">
                Join{" "}
                <strong className="text-[#c84b31]">48 creators</strong>{" "}
                publishing independently.
              </p>
            </div>
          </aside>

          {/* ─── CENTER: MAIN FEED ────────────────────────────────── */}
          <main className="col-span-1 lg:col-span-7">
            {/* Journal Header (Alder & Co. style) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border-b border-[#e5dfd3] pb-6 mb-7"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c84b31] bg-[#c84b31]/8 px-3 py-1 rounded-full inline-block mb-3">
                ✦ Editorial Space
              </span>
              <h1 className="text-[30px] md:text-[38px] font-serif font-black tracking-tight text-[#1e1b18] leading-[1.15]">
                The BlogSphere Journal
              </h1>
              <p className="text-[13.5px] text-[#8a7e70] font-light leading-relaxed mt-2 max-w-[480px]">
                Discover premium essays, journals, tech notes, and designer
                guidelines from creative minds.
              </p>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 mb-7"
            >
              {tags.map((tag) => (
                <Link key={tag} to={tag === "All" ? "/" : `/tag/${tag}`}>
                  <button
                    onClick={() => setActiveTag(tag)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-200 cursor-pointer ${
                      activeTag === tag
                        ? "bg-[#1e1b18] text-[#faf7f2] border-[#1e1b18] shadow-sm"
                        : "bg-transparent text-[#5a4e40] border-[#e5dfd3] hover:border-[#c84b31] hover:text-[#c84b31]"
                    }`}
                  >
                    {tag === "All" ? "All posts" : tag}
                  </button>
                </Link>
              ))}
            </motion.div>

            {/* Featured Blog (Alder & Co. split card) */}
            {featuredBlog && activeTag === "All" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="mb-10"
              >
                <Link
                  to={`/blog/${featuredBlog.blogId}`}
                  className="group block"
                >
                  <div className="bg-white rounded-[20px] overflow-hidden border border-[#e5dfd3]/60 shadow-[0_2px_18px_rgba(100,80,50,0.03)] hover:shadow-[0_10px_40px_rgba(100,80,50,0.09)] transition-all duration-500">
                    {/* Image */}
                    <div className="h-[220px] md:h-[280px] overflow-hidden relative">
                      <img
                        src={featuredBlog.image}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#c84b31] px-3 py-1 rounded-full shadow-md">
                          Featured
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-6 md:p-8">
                      {featuredBlog.tags?.[0] && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#c84b31] mb-2 block">
                          {featuredBlog.tags[0]}
                        </span>
                      )}
                      <h2 className="text-[20px] md:text-[24px] font-serif font-bold text-[#1e1b18] leading-snug group-hover:text-[#c84b31] transition-colors mb-3">
                        {featuredBlog.title}
                      </h2>
                      <p className="text-[13px] text-[#8a7e70] leading-relaxed line-clamp-2 mb-5">
                        {featuredBlog.description}
                      </p>
                      {/* Author row + Read CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#f0ebe3]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5dfd3]">
                            <img
                              src={
                                featuredBlog.creator?.profilePicture ||
                                `https://api.dicebear.com/9.x/initials/svg?seed=${featuredBlog.creator?.name}`
                              }
                              alt="author"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-[#1e1b18] leading-none">
                              {featuredBlog.creator?.name}
                            </p>
                            <p className="text-[10px] text-[#a09890] mt-0.5">
                              {formatDate(featuredBlog.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#c84b31] border border-[#c84b31]/30 px-3.5 py-1.5 rounded-full hover:bg-[#c84b31] hover:text-white transition-all flex items-center gap-1">
                          Read Story <ArrowUpRight size={11} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Latest Publications header */}
            {feedBlogs.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-[#e5dfd3]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8a7e70]">
                  Latest Publications
                </h3>
                <div className="h-px flex-1 bg-[#e5dfd3]" />
              </div>
            )}

            {/* Blog Feed */}
            <DisplayBlogs
              blogs={activeTag === "All" ? feedBlogs : blogs}
            />

            {/* Infinite scroll loader */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-12">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#c84b31] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#c84b31] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#c84b31] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            {isLoading && blogs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full bg-[#c84b31] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[#c84b31] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[#c84b31] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <p className="text-[12px] text-[#a09890]">
                  Loading stories...
                </p>
              </div>
            )}
          </main>

          {/* ─── RIGHT SIDEBAR (Trending / Writers) ───────────────── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit pl-2">
            {/* Editorial Voices */}
            <div className="bg-white rounded-2xl border border-[#e5dfd3]/60 p-5 mb-5 shadow-[0_1px_6px_rgba(100,80,50,0.04)]">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck size={14} className="text-[#c84b31]" />
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1e1b18]">
                  Editorial Voices
                </h4>
              </div>
              <div className="space-y-3.5">
                {blogs.slice(0, 3).map((blog, idx) => (
                  <Link
                    key={idx}
                    to={`/@${blog.creator?.username}`}
                    className="flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-[#e5dfd3]">
                        <img
                          src={
                            blog.creator?.profilePicture ||
                            `https://api.dicebear.com/9.x/initials/svg?seed=${blog.creator?.name}`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[11.5px] font-bold leading-tight group-hover:text-[#c84b31] transition-colors">
                          {blog.creator?.name}
                        </p>
                        <p className="text-[9.5px] text-[#8a7e70]">Writer</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#8a7e70] bg-[#f0ebe3] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Stories */}
            <div className="bg-white rounded-2xl border border-[#e5dfd3]/60 p-5 shadow-[0_1px_6px_rgba(100,80,50,0.04)]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[#c84b31]" />
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1e1b18]">
                  Trending Now
                </h4>
              </div>
              <div className="space-y-4">
                {trendingList.length > 0 ? (
                  trendingList.map((blog, idx) => (
                    <Link
                      key={idx}
                      to={`/blog/${blog.blogId}`}
                      className="group block"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[18px] font-serif font-black text-[#e5dfd3] leading-none group-hover:text-[#c84b31] transition-colors min-w-[24px]">
                          0{idx + 1}
                        </span>
                        <div>
                          <h5 className="text-[11.5px] font-bold text-[#1e1b18] leading-snug group-hover:text-[#c84b31] transition-colors line-clamp-2">
                            {blog.title}
                          </h5>
                          <p className="text-[9.5px] text-[#8a7e70] mt-1 flex items-center gap-1.5">
                            <span>{blog.creator?.name}</span>
                            <span>·</span>
                            <Heart
                              size={8}
                              className="fill-[#a09890] text-[#a09890]"
                            />
                            <span>{blog.likes?.length || 0}</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-[11px] text-[#a09890]">
                    No trending stories yet.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
