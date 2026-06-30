import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Feather, Search, Heart,
  MessageCircle, Bookmark, Sparkles, BookOpen, PenTool, Check, X
} from "lucide-react";
import { formatDate } from "../Utils/formateDate";
import googleIcon from "../assets/google-icon-logo-svgrepo-com.svg";
import { googleAuth } from "../Utils/firebase";
import { useDispatch } from "react-redux";
import { login } from "../Utils/UserSlice";
import axios from "axios";
import toast from "react-hot-toast";

/* ─── SCROLL REVEAL WRAPPER ────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "", from = "bottom" }) {
  const y = from === "bottom" ? 24 : from === "top" ? -24 : 0;
  const x = from === "left" ? -24 : from === "right" ? 24 : 0;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── DYNAMIC ART/BLOG CARDS FOR THE SLIDER (Image 2 style) ───────── */
const visualDecks = [
  {
    topic: "Humanities & Philosophy",
    title: "The Architecture of Thought",
    tag: "Essays",
    bg: "bg-[#e5dfd3]",
    textColor: "text-[#3a352d]",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80",
    desc: "Exploring modern perspectives on ancient wisdom.",
    shape: "url(#arch-mask)"
  },
  {
    topic: "Design & Aesthetics",
    title: "Designing for the Silent Mind",
    tag: "Minimalism",
    bg: "bg-[#e8dcd0]",
    textColor: "text-[#4a3a2d]",
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80",
    desc: "Why space and silence are the ultimate luxuries.",
    shape: "url(#clover-mask)"
  },
  {
    topic: "Technology & Culture",
    title: "Code, Ethics & Creative Chaos",
    tag: "Tech",
    bg: "bg-[#dae2d9]",
    textColor: "text-[#2d3a2f]",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80",
    desc: "Understanding the digital shift through human eyes.",
    shape: "url(#leaf-mask)"
  },
  {
    topic: "Literary Arts",
    title: "Writing Under the Midnight Sun",
    tag: "Fiction",
    bg: "bg-[#ddd9e2]",
    textColor: "text-[#342d3a]",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=500&q=80",
    desc: "A series of short prose and narrative journeys.",
    shape: "url(#blob-mask)"
  }
];

export default function LandingPage({ blogs, hasMore, isLoading, setPage, loaderRef }) {
  const [searchVal, setSearchVal] = useState("");
  const [hoveredDeck, setHoveredDeck] = useState(0);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
      const user = await googleAuth();
      if (user) {
        const idToken = await user.getIdToken();
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`, { accessToken: idToken });
        dispatch(login(res.data.user));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google login failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/search?q=${searchVal.trim()}`);
  };

  const featuredBlog = blogs?.[0];
  const listBlogs = blogs?.slice(1, 6) || [];

  return (
    <div className="bg-[#faf7f2] text-[#1e1b18] min-h-screen relative overflow-x-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ─── DYNAMIC SVG MASK DEFINITIONS (Image 4 & 5 inspired) ──────── */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          {/* Arch / Window shape */}
          <clipPath id="arch-mask" clipPathUnits="objectBoundingBox">
            <path d="M 0,1 L 0,0.4 C 0,0.18 0.22,0 0.5,0 C 0.78,0 1,0.18 1,0.4 L 1,1 Z" />
          </clipPath>
          {/* Symmetrical Leaf shape */}
          <clipPath id="leaf-mask" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0 C 0.95,0.2 1,0.6 0.75,0.85 C 0.5,1 0.5,1 0.5,1 C 0.5,1 0.5,1 0.25,0.85 C 0,0.6 0.05,0.2 0.5,0 Z" />
          </clipPath>
          {/* Elegant Clover/Flower shape */}
          <clipPath id="clover-mask" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0.05 C 0.65,0.02 0.8,0.15 0.82,0.3 C 0.98,0.32 1.02,0.5 0.9,0.65 C 0.92,0.8 0.78,0.92 0.65,0.9 C 0.5,1.02 0.32,0.98 0.3,0.82 C 0.15,0.84 0.02,0.7 0.05,0.55 C -0.02,0.4 0.1,0.22 0.25,0.25 C 0.28,0.1 0.42,-0.02 0.5,0.05 Z" />
          </clipPath>
          {/* Smooth Fluid Blob shape */}
          <clipPath id="blob-mask" clipPathUnits="objectBoundingBox">
            <path d="M 0.2,0.1 C 0.45,0.01 0.75,0.05 0.9,0.25 C 1,0.45 0.95,0.75 0.8,0.9 C 0.6,1.05 0.3,0.95 0.15,0.8 C -0.05,0.6 -0.05,0.3 0.2,0.1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ─── BACKGROUND ORGANIC DECORATIVE LINES (Image 4 & 5 inspired) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="w-full h-full" viewBox="0 0 1440 2500" fill="none">
          {/* Loop line 1 */}
          <motion.path
            d="M -100,200 Q 300,50 600,350 T 1300,100 T 1600,600"
            stroke="#e5dfd3"
            strokeWidth="2"
            strokeDasharray="8 8"
            className="animate-draw-line"
          />
          {/* Loop line 2 */}
          <motion.path
            d="M 100,900 C 600,800 500,1300 1100,1200"
            stroke="#e2d4c0"
            strokeWidth="1.5"
          />
          {/* Loop line 3 */}
          <motion.path
            d="M -50,1800 Q 400,2100 800,1800 T 1500,2000"
            stroke="#e5dfd3"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
        </svg>
      </div>

      {/* ════════════════════════════════════════════
          § 1 HERO SECTION
          ─ Giant bold layout with centered serif text
          ─ Floating art postcards with organic shapes
          ─ Cream dot-grid background
      ════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 dot-grid z-10">

        {/* Scattered Floating Cards (Image 3 inspired) */}
        {/* Card 1 - Top Left */}
        <div
          className="absolute hidden lg:block left-[4%] top-[14%] w-48 bg-white p-3.5 pb-6 border border-[#e5dfd3] shadow-[0_8px_30px_rgba(100,80,50,0.06)] rounded-xl animate-float-1 select-none cursor-pointer hover:z-30 transition-all duration-300"
          style={{ transform: "rotate(-5deg)" }}
        >
          <div className="w-full h-36 bg-[#f0e8dc] overflow-hidden" style={{ clipPath: "url(#arch-mask)" }}>
            <img src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
          </div>
          <p className="mt-3 text-[12px] font-bold text-[#c84b31] tracking-wide uppercase">Volume 01</p>
          <p className="text-[14px] font-bold text-[#1e1b18] mt-1 font-serif">Fine Aesthetics</p>
        </div>

        {/* Card 2 - Top Right */}
        <div
          className="absolute hidden lg:block right-[5%] top-[16%] w-48 bg-white p-3.5 pb-6 border border-[#e5dfd3] shadow-[0_8px_30px_rgba(100,80,50,0.06)] rounded-xl animate-float-2 select-none cursor-pointer hover:z-30 transition-all duration-300"
          style={{ transform: "rotate(6deg)" }}
        >
          <div className="w-full h-36 bg-[#f0e8dc] overflow-hidden" style={{ clipPath: "url(#clover-mask)" }}>
            <img src="https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
          </div>
          <p className="mt-3 text-[12px] font-bold text-[#3a4f3f] tracking-wide uppercase">Essays</p>
          <p className="text-[14px] font-bold text-[#1e1b18] mt-1 font-serif">Poetry of Place</p>
        </div>

        {/* Card 3 - Bottom Left */}
        <div
          className="absolute hidden lg:block left-[3%] bottom-[16%] w-52 bg-white p-4 border border-[#e5dfd3] shadow-[0_8px_30px_rgba(100,80,50,0.06)] rounded-xl animate-float-3 select-none cursor-pointer hover:z-30 transition-all duration-300"
          style={{ transform: "rotate(-3deg)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c84b31]" />
            <span className="text-[11px] font-bold text-[#a08060] uppercase tracking-wider">Trending</span>
          </div>
          <h4 className="text-[15px] font-black text-[#1e1b18] leading-snug font-serif">"Why the best writers publish on their own terms."</h4>
          <p className="text-[11px] text-[#b8a080] mt-3">Read time 4 min</p>
        </div>

        {/* Card 4 - Bottom Right */}
        <div
          className="absolute hidden lg:block right-[4%] bottom-[14%] w-48 bg-white p-3.5 pb-6 border border-[#e5dfd3] shadow-[0_8px_30px_rgba(100,80,50,0.06)] rounded-xl animate-float-1 select-none cursor-pointer hover:z-30 transition-all duration-300"
          style={{ transform: "rotate(4deg)" }}
        >
          <div className="w-full h-36 bg-[#f0e8dc] overflow-hidden" style={{ clipPath: "url(#leaf-mask)" }}>
            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
          </div>
          <p className="mt-3 text-[12px] font-bold text-[#d4a956] tracking-wide uppercase">Botanicals</p>
          <p className="text-[14px] font-bold text-[#1e1b18] mt-1 font-serif">Organic Forms</p>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Eyebrow / Accent Badge (Image 5 style) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e2d4c0] bg-white text-[#8a7050] text-[11px] font-bold uppercase tracking-wider mb-6 shadow-sm"
          >
            <Sparkles size={11} className="text-[#c84b31]" />
            An open editorial workspace
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="text-[clamp(2.8rem,7.5vw,6rem)] font-bold leading-[1.0] tracking-tight text-[#1e1b18] mb-8 font-serif"
            style={{ letterSpacing: "-0.03em" }}
          >
            DISCOVER THE<br />
            <span className="italic text-[#c84b31] font-normal font-serif">story</span> WITHIN YOU.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[16px] md:text-[18px] text-[#6b6259] max-w-lg mx-auto font-light leading-relaxed mb-10"
          >
            Join a stunning network of writers and creators sharing thoughts, designs, essays, and stories without distraction.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <motion.button
              onClick={handleGoogleAuth}
              whileHover={{ scale: 1.02, y: -2, boxShadow: "0 8px 24px rgba(100,80,50,0.06)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3.5 bg-white border border-[#e5dfd3] hover:border-[#b8a080] text-[#1e1b18] font-bold px-8 py-3.5 rounded-full text-[14.5px] cursor-pointer transition-all duration-200"
            >
              <img src={googleIcon} alt="" className="w-5 h-5" />
              Continue with Google
            </motion.button>
            <button
              onClick={() => document.getElementById("publications")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 border border-[#b8a898] hover:border-[#1e1b18] text-[#1e1b18] font-bold px-8 py-4 rounded-full text-[15px] transition cursor-pointer"
            >
              Explore publications <ArrowRight size={15} />
            </button>
          </motion.div>

          {/* Search bar (Image 5 style) */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSearch}
            className="max-w-md mx-auto relative"
          >
            <div className="flex items-center bg-white border border-[#ddd6cc] rounded-full px-5 py-3 hover:border-[#b8a080] transition shadow-sm">
              <Search size={16} className="text-[#a09488]" />
              <input
                type="text"
                placeholder="Search authors, tags, stories..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="flex-1 ml-3 bg-transparent outline-none text-[14px] text-[#1e1b18] placeholder:text-[#a09488] font-medium"
              />
              {searchVal && (
                <button type="submit" className="bg-[#1e1b18] text-white text-[11px] font-bold px-3 py-1.5 rounded-full ml-2">
                  Go
                </button>
              )}
            </div>
          </motion.form>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 2 VISUAL DECK CAROUSEL (Image 2 style)
          ─ Centered, raised slider cards
      ════════════════════════════════════════════ */}
      <section className="py-20 px-6 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#a08060] mb-2">Curated categories</p>
            <h2 className="text-[32px] md:text-[40px] font-bold font-serif text-[#1e1b18]">Dive into deep channels</h2>
          </Reveal>

          {/* Slider deck */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {visualDecks.map((deck, idx) => {
              const isActive = hoveredDeck === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDeck(idx)}
                  className={`p-6 rounded-3xl border border-[#e5dfd3] ${deck.bg} ${deck.textColor} transition-all duration-500 cursor-pointer
                    ${isActive ? "md:-translate-y-4 md:shadow-[0_12px_40px_rgba(100,80,50,0.12)]" : "md:opacity-75"}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full">
                      {deck.tag}
                    </span>
                    <ArrowUpRight size={18} />
                  </div>

                  <div className="w-full h-40 mb-6 bg-[#f0e8dc] overflow-hidden rounded-2xl" style={{ clipPath: deck.shape }}>
                    <img src={deck.img} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500" />
                  </div>

                  <h3 className="text-[18px] font-bold font-serif leading-tight mb-2">{deck.title}</h3>
                  <p className="text-[13px] font-light leading-relaxed">{deck.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 3 TERRACOTTA FEATURE BLOCK (Image 3 style)
          ─ High contrast rust-red panel
          ─ Writing interface mockup
      ════════════════════════════════════════════ */}
      <section className="py-16 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#c84b31] rounded-[32px] text-white p-8 md:p-14 overflow-hidden relative shadow-[0_15px_40px_rgba(200,75,49,0.22)]">
            {/* Background glowing circle */}
            <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#ffd0b0] mb-3">Distraction-free</p>
                <h2 className="text-[28px] md:text-[38px] font-bold font-serif leading-tight mb-6">
                  A writing engine that feels like paper.
                </h2>
                <ul className="space-y-4">
                  {[
                    "Clean block-based document flow (medium style)",
                    "Supports beautiful code embeds, tables, and media",
                    "Fully optimized for readability and organic SEO"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[14px] md:text-[15px] font-light text-stone-100">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#ffd0b0] shrink-0">
                        <Check size={11} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Editor Mockup (Image 3 Left Bottom inspired) */}
              <div className="bg-white rounded-2xl border border-white/10 text-[#1e1b18] shadow-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-[#faf6ef] mb-5">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-[11px] text-[#a09488] font-mono">editor.js</span>
                </div>

                <p className="text-[13px] font-bold text-[#c84b31] uppercase tracking-wider mb-2">Category: Philosophy</p>
                <h3 className="text-[20px] font-bold font-serif leading-tight text-[#1e1b18] mb-4">
                  The Aesthetics of Stillness
                </h3>

                <p className="text-[12.5px] text-[#6b6259] leading-relaxed mb-4">
                  In a world dominated by constant updates, building a quiet space isn't just design — it's resistance...
                </p>

                {/* Simulated code block inside editor */}
                <div className="bg-[#faf7f2] border border-[#e5dfd3] p-4 rounded-xl font-mono text-[11px] text-[#4a3a2d] mb-4">
                  <span className="text-amber-700">const</span> space = <span className="text-blue-800">new</span> Space();<br />
                  space.on(<span className="text-emerald-700">'noise'</span>, () =&gt; space.filter());
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#a09488] border-t border-[#faf6ef] pt-3">
                  <span>Words: 432</span>
                  <span>Draft saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 4 LATEST PUBLICATIONS (Image 1 style)
          ─ Minimal, elegant list feed
          ─ Clover / Leaf masked thumbnail previews
      ════════════════════════════════════════════ */}
      <section id="publications" className="py-20 px-6 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-12 flex justify-between items-end">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#a08060] mb-2">Recent works</p>
              <h2 className="text-[32px] font-bold font-serif text-[#1e1b18]">Latest publications</h2>
            </div>
            <Link to="/search" className="text-[13px] font-bold text-[#c84b31] hover:underline flex items-center gap-1">
              Read all <ArrowUpRight size={15} />
            </Link>
          </Reveal>

          {/* List Feed */}
          {listBlogs.length > 0 ? (
            <div className="divide-y divide-[#e5dfd3]">
              {listBlogs.map((blog, index) => {
                // cycle different organic shapes
                const masks = ["url(#arch-mask)", "url(#leaf-mask)", "url(#clover-mask)", "url(#blob-mask)"];
                const currentMask = masks[index % masks.length];

                return (
                  <Reveal key={blog._id} delay={index * 0.08}>
                    <Link to={`/blog/${blog.blogId}`} className="group flex gap-6 items-start py-8 hover:bg-[#fffdfb] -mx-4 px-4 rounded-2xl transition duration-300">
                      {/* Index Number */}
                      <span className="text-[14px] font-bold text-[#a08060] font-serif shrink-0 mt-1">
                        {String(index + 1).padStart(2, "0")}.
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={blog.creator?.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${blog.creator?.name}`}
                            className="w-5.5 h-5.5 rounded-full object-cover border border-[#e5dfd3]"
                            alt=""
                          />
                          <span className="text-[12.5px] font-semibold text-[#5a4e40]">{blog.creator?.name}</span>
                          <span className="text-[#c4b8aa]">·</span>
                          <span className="text-[11.5px] text-[#9a8e80]">{formatDate(blog.createdAt)}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-[18px] md:text-[20px] font-bold font-serif text-[#1e1b18] group-hover:text-[#c84b31] transition-colors leading-snug mb-2">
                          {blog.title}
                        </h3>

                        {/* Excerpt */}
                        {blog.description && (
                          <p className="text-[13.5px] text-[#6b6259] font-light leading-relaxed line-clamp-2">
                            {blog.description}
                          </p>
                        )}
                      </div>

                      {/* Thumbnail Image with Clover/Leaf Mask */}
                      {blog.image && (
                        <div
                          className="w-24 h-24 md:w-28 md:h-28 shrink-0 overflow-hidden bg-[#e5dfd3]"
                          style={{ clipPath: currentMask }}
                        >
                          <img
                            src={blog.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-[#ddd6cc] rounded-3xl bg-white/40">
              <BookOpen size={36} className="text-[#a09488] mx-auto mb-3" />
              <p className="text-[14px] font-bold text-[#1e1b18] mb-1">No publications yet</p>
              <p className="text-[12px] text-[#9a8e80]">Be the first to publish a beautiful story.</p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 5 INTERACTIVE WRITER CTA BANNER (Image 5 style)
          ─ Oval portrait with floating text pills
      ════════════════════════════════════════════ */}
      <section className="py-20 px-6 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1e1b18] text-[#faf7f2] rounded-[36px] p-10 md:p-16 relative overflow-hidden text-center border border-[#2d2722] shadow-2xl">
            {/* Dot grid inside dark banner */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #faf7f2 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              {/* Writer Portrait & Floating Pills (Image 5 style) */}
              <div className="relative w-44 h-44 mb-10">
                {/* Oval/Organic Masked Portrait */}
                <div
                  className="w-full h-full bg-[#c84b31] overflow-hidden shadow-lg border-2 border-white/10"
                  style={{ clipPath: "url(#clover-mask)" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt="Writer portrait"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating indicator pills around the writer */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -right-8 bg-[#c84b31] text-[11px] font-bold text-white px-3 py-1 rounded-full shadow-md whitespace-nowrap"
                >
                  ✦ Philosophy Writer
                </motion.div>

                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-6 -left-12 bg-white text-[11px] font-bold text-[#1e1b18] px-3 py-1 rounded-full shadow-md whitespace-nowrap border border-[#e5dfd3]"
                >
                  ✎ 5k+ Reads
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 right-2 bg-[#d4a956] text-[10px] font-bold text-[#1e1b18] px-2.5 py-1 rounded-full shadow-md whitespace-nowrap"
                >
                  ★ Top Author
                </motion.div>
              </div>

              <p className="text-[12px] font-bold uppercase tracking-widest text-[#ffd0b0] mb-4">Start your own journal</p>
              <h2 className="text-[32px] md:text-[44px] font-bold font-serif leading-tight mb-6">
                Your ideas deserve a beautiful shelf.
              </h2>
              <p className="text-[14px] md:text-[15px] text-[#c4b8aa] font-light leading-relaxed mb-8">
                Connect with readers, build your independent audience, and publish stories exactly as you envision them.
              </p>

              {/* Action */}
              <motion.button
                onClick={handleGoogleAuth}
                whileHover={{ scale: 1.02, y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3.5 bg-white hover:bg-[#faf7f2] text-[#1e1b18] font-bold px-8 py-3.5 rounded-full text-[14.5px] cursor-pointer transition-colors duration-200"
              >
                <img src={googleIcon} alt="" className="w-5 h-5" />
                Join BlogSphere — Free
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 6 FOOTER (Image 1 style)
      ════════════════════════════════════════════ */}
      {/* <footer className="bg-[#faf7f2] border-t border-[#e5dfd3] py-16 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Feather size={18} className="text-[#c84b31]" />
            <span className="text-[18px] font-bold font-serif text-[#1e1b18]">BlogSphere</span>
          </div>

          <p className="text-[12.5px] text-[#8a7e70] font-light">
            © 2026 BlogSphere. Built for beautiful minds.
          </p>

          <div className="flex gap-6 text-[13px] font-semibold text-[#6b6259]">
            <Link to="/signin" className="hover:text-[#c84b31] transition">Sign In</Link>
            <Link to="/signup" className="hover:text-[#c84b31] transition">Sign Up</Link>
            <a href="#publications" className="hover:text-[#c84b31] transition">Explore</a>
          </div>
        </div>
      </footer> */}

    </div>
  );
}
