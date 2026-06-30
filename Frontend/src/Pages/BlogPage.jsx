import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addSelectedBlog, changeLikes, removeSelectedBlog } from '../Utils/SelectedBlogSlice';
import { setIsOpen } from '../Utils/commnetSlice';
import Comment from '../Components/Comment';
import { formatDate } from '../Utils/formateDate';
import { updateData } from '../Utils/UserSlice';
import { AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

// Function to calculate read time
function calculateReadTime(content) {
  if (!content || !content.blocks) return 0;
  
  const wordCount = content.blocks.reduce((count, block) => {
    if (block.type === 'paragraph' || block.type === 'header') {
      const text = block.data.text.replace(/<[^>]*>/g, '');
      return count + text.split(/\s+/).length;
    }
    return count;
  }, 0);

  const wordsPerMinute = 120;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime || 1;
}

export async function handleSaveBlogs(id, token) {
  if (token) {
    try {
      let res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/save-blog/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving blog");
    }
  } else {
    toast.error("Please Sign In first!");
  }
}

export async function handleFollowCreator(id, token, dispatch) {
  try {
    let res = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/follow/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success(res.data.message);
    dispatch(updateData(["followers", id]));
  } catch (error) {
    toast.error(error.response?.data?.message || "Error following creator");
  }
}

function BlogPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isBlogSaved, setIsBlogSaved] = useState(false);
  const [readTime, setReadTime] = useState(0);

  const { token, email, id: userId, following } = useSelector((state) => state.user);
  const { likes, comments, content } = useSelector((state) => state.SelectedBlog);
  const { isOpen } = useSelector((state) => state.comment);

  const [blogData, setBlogData] = useState(null);
  const [isLike, setIsLike] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchBlogsById = React.useCallback(async () => {
    try {
      let { data: { blog } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
      setBlogData(blog);
      setIsBlogSaved(blog?.totalSaves?.includes(userId));
      dispatch(addSelectedBlog(blog));
      
      if (blog.content) {
        setReadTime(calculateReadTime(blog.content));
      }
      
      if (blog.likes.includes(userId)) {
        setIsLike(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [id, userId, dispatch]);

  async function handleLike() {
    if (token) {
      try {
        setIsLike((prev) => !prev);
        let res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(changeLikes(userId));
        toast.success(res.data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred.");
      }
    } else {
      toast.error("Please Sign In first!");
    }
  }

  async function handleDeleteBlog() {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogData._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(res.data.message);
        navigate("/");
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting blog");
      }
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    fetchBlogsById();
    return () => {
      dispatch(setIsOpen(false));
      if (window.location.pathname !== `/edit/${id}` &&
        window.location.pathname !== `/blog/${id}`) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id, dispatch, fetchBlogsById]);

  return (
    <div 
      className={`w-full bg-[#faf7f2] min-h-screen text-[#1e1b18] pb-28 transition-all duration-300 ${
        isOpen ? "lg:pr-[450px]" : ""
      }`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Article Container (bleeds wider for header and media) */}
      <div className="max-w-[1000px] mx-auto px-6 pt-8">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-bold text-[#8a7e70] hover:text-[#c84b31] transition mb-8 cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
        </button>

        {blogData ? (
          <article>
            
            {/* Header Content */}
            <div className="w-full text-center md:text-left mb-8">
              {/* Category tag */}
              {blogData.tags?.[0] && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c84b31] bg-[#c84b31]/8 px-3 py-1 rounded-full w-fit mb-4 inline-block">
                  {blogData.tags[0]}
                </span>
              )}

              {/* Title */}
              <h1 className="text-[34px] sm:text-[44px] md:text-[54px] font-serif font-black tracking-tight text-[#1e1b18] leading-[1.12] mb-6 capitalize">
                {blogData.title}
              </h1>

              {/* Author widget */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/70 border border-[#e5dfd3] rounded-2xl shadow-[0_1px_6px_rgba(100,80,50,0.02)] gap-4">
                <div className="flex items-center gap-3.5">
                  <Link to={`/@${blogData.creator.username}`}>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#c84b31]/20 hover:border-[#c84b31] hover:scale-105 transition-all shadow-sm">
                      <img
                        src={
                          blogData?.creator?.profilePicture ||
                          `https://api.dicebear.com/9.x/initials/svg?seed=${blogData.creator.name}`
                        }
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link to={`/@${blogData.creator.username}`}>
                        <h2 className="text-[15px] font-bold hover:text-[#c84b31] transition capitalize">
                          {blogData.creator.name}
                        </h2>
                      </Link>
                      {userId !== blogData.creator._id && (
                        <button
                          onClick={() => handleFollowCreator(blogData.creator._id, token, dispatch)}
                          className="text-[10px] font-bold uppercase tracking-widest cursor-pointer bg-[#1e1b18] text-white hover:bg-[#c84b31] px-2.5 py-0.5 rounded-full transition-all"
                        >
                          {!following?.includes(blogData.creator._id) ? "Follow" : "Following"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#8a7e70] font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[#c84b31]" />
                        {readTime} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(blogData.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit/Delete options (if creator) */}
                {token && email === blogData.creator.email && (
                  <div className="flex gap-2">
                    <Link to={"/edit/" + blogData.blogId}>
                      <button className="flex items-center gap-1.5 border border-[#e5dfd3] bg-white hover:bg-[#faf7f2] px-3.5 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition">
                        <Edit size={12} /> Edit
                      </button>
                    </Link>
                    <button 
                      onClick={handleDeleteBlog}
                      className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Static Action Bar (Top) */}
            <div className="w-full flex items-center justify-between border-y border-[#e5dfd3] py-3.5 mb-10 text-[#5a4e40]">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 hover:text-red-500 cursor-pointer transition"
                >
                  <Heart size={18} className={isLike ? "fill-red-500 text-red-500" : ""} />
                  <span className="text-[13px] font-bold">{likes.length}</span>
                </button>

                <button
                  onClick={() => dispatch(setIsOpen())}
                  className="flex items-center gap-2 hover:text-[#c84b31] cursor-pointer transition"
                >
                  <MessageSquare size={18} />
                  <span className="text-[13px] font-bold">{comments.length}</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveBlogs(blogData._id, token);
                    if (token) {
                      setIsBlogSaved((prev) => !prev);
                    }
                  }}
                  className="hover:text-[#c84b31] cursor-pointer transition"
                  title={isBlogSaved ? "Saved" : "Save story"}
                >
                  <Bookmark size={18} className={isBlogSaved ? "fill-[#c84b31] text-[#c84b31]" : ""} />
                </button>

                <button
                  onClick={handleShare}
                  className="hover:text-[#c84b31] cursor-pointer transition"
                  title="Share link"
                >
                  {copiedLink ? <CheckCircle2 size={18} className="text-green-500" /> : <Share2 size={18} />}
                </button>
              </div>
            </div>

            {/* Wide Bleed Featured Image */}
            <div className="w-full mb-12 overflow-hidden rounded-[24px] shadow-[0_8px_32px_rgba(100,80,50,0.06)] border border-[#e5dfd3]">
              <img src={blogData.image} alt="" className="w-full h-auto object-cover max-h-[500px]" />
            </div>

            {/* Premium Article Body (centered & readable width) */}
            <div className="w-full">
              <div className="prose prose-stone text-[#2a2623] text-[16.5px] sm:text-[18px] leading-[1.85] font-light">
                {content?.blocks?.length > 0 &&
                  content.blocks.map((block, index) => {
                    if (block.type === "header") {
                      if (block.data.level === 2) {
                        return (
                          <h2
                            key={index}
                            className="font-serif font-black text-[25px] sm:text-[31px] text-[#1e1b18] mt-10 mb-4 leading-tight border-l-2 border-[#c84b31] pl-3.5"
                            dangerouslySetInnerHTML={{ __html: block.data.text }}
                          ></h2>
                        );
                      } else if (block.data.level === 3) {
                        return (
                          <h3
                            key={index}
                            className="font-serif font-bold text-[20px] sm:text-[25px] text-[#1e1b18] mt-8 mb-3"
                            dangerouslySetInnerHTML={{ __html: block.data.text }}
                          ></h3>
                        );
                      } else {
                        return (
                          <h4
                            key={index}
                            className="font-bold text-[16px] sm:text-[21px] text-[#1e1b18] mt-6 mb-3"
                            dangerouslySetInnerHTML={{ __html: block.data.text }}
                          ></h4>
                        );
                      }
                    } else if (block.type === "paragraph") {
                      // Apply Drop-Cap on the first paragraph block
                      const isFirstParagraph = !content.blocks.slice(0, index).some(b => b.type === 'paragraph');
                      return (
                        <p
                          key={index}
                          className={`my-5 text-[16.5px] sm:text-[18.5px] text-[#2a2623] leading-[1.85] font-light ${
                            isFirstParagraph 
                              ? "first-letter:text-[50px] first-letter:font-serif first-letter:font-black first-letter:text-[#c84b31] first-letter:float-left first-letter:mr-2.5 first-letter:mt-1.5" 
                              : ""
                          }`}
                          dangerouslySetInnerHTML={{ __html: block.data.text }}
                        ></p>
                      );
                    } else if (block.type === "image") {
                      return (
                        <div className="my-8 flex flex-col items-center" key={index}>
                          <img src={block.data.file.url} alt="" className="rounded-2xl max-w-full shadow-sm border border-[#e5dfd3]/65" />
                          {block.data.caption && (
                            <p className="text-center text-[12.5px] text-[#8a7e70] italic mt-2.5 leading-relaxed max-w-[85%]">
                              {block.data.caption}
                            </p>
                          )}
                        </div>
                      );
                    } else if (block.type === "List") {
                      const isOrdered = block.data.style === "ordered";
                      const Tag = isOrdered ? "ol" : "ul";
                      const listClass = isOrdered 
                        ? "list-decimal pl-6 my-5 space-y-2 text-[16px] sm:text-[17.5px]" 
                        : "list-disc pl-6 my-5 space-y-2 text-[16px] sm:text-[17.5px]";
                      
                      const renderItems = (items) => {
                        return items.map((item, idx) => {
                          const contentText = typeof item === "string" ? item : item.content;
                          const subItems = item.items || [];
                          return (
                            <li key={idx} className="my-1">
                              <span dangerouslySetInnerHTML={{ __html: contentText }} />
                              {subItems.length > 0 && (
                                <Tag className={isOrdered ? "list-decimal pl-5 mt-2 space-y-1" : "list-disc pl-5 mt-2 space-y-1"}>
                                  {renderItems(subItems)}
                                </Tag>
                              )}
                            </li>
                          );
                        });
                      };

                      return (
                        <Tag key={index} className={listClass}>
                          {renderItems(block.data.items)}
                        </Tag>
                      );
                    } else if (block.type === "code") {
                      return (
                        <div key={index} className="my-6 relative font-mono text-[14px] bg-[#1e1b18] text-[#faf7f2] rounded-2xl overflow-hidden shadow-md">
                          <div className="flex items-center justify-between px-5 py-2.5 bg-black/30 border-b border-white/5 text-[11px] font-bold text-[#8a7e70] uppercase tracking-wider">
                            <span>Code Snippet</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(block.data.code);
                                toast.success("Code copied!");
                              }}
                              className="hover:text-white transition cursor-pointer text-[10px] text-white/70"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="p-6 overflow-x-auto scrollbar-thin"><code className="block">{block.data.code}</code></pre>
                        </div>
                      );
                    } else if (block.type === "table") {
                      const content = block.data.content || [];
                      const withHeadings = block.data.withHeadings;
                      if (content.length === 0) return null;

                      return (
                        <div key={index} className="overflow-x-auto my-8 border border-[#e5dfd3] rounded-2xl">
                          <table className="min-w-full divide-y divide-[#e5dfd3] text-left text-[14.5px]">
                            {withHeadings && (
                              <thead className="bg-[#fcfbfa]">
                                <tr>
                                  {content[0].map((cell, idx) => (
                                    <th key={idx} className="px-6 py-4 font-bold text-[#1e1b18] border-b border-[#e5dfd3]" dangerouslySetInnerHTML={{ __html: cell }} />
                                  ))}
                                </tr>
                              </thead>
                            )}
                            <tbody className="divide-y divide-[#e5dfd3]/60 bg-white">
                              {(withHeadings ? content.slice(1) : content).map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-[#faf7f2]/40 transition-colors">
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-6 py-4 text-[#5a4e40] font-light" dangerouslySetInnerHTML={{ __html: cell }} />
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    } else if (block.type === "embed") {
                      return (
                        <div key={index} className="my-8 flex flex-col items-center">
                          <div className="w-full relative aspect-video rounded-2xl overflow-hidden shadow-md border border-[#e5dfd3]">
                            <iframe
                              src={block.data.embed}
                              width="100%"
                              height="100%"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              className="absolute inset-0 border-0"
                              title={block.data.service}
                            ></iframe>
                          </div>
                          {block.data.caption && (
                            <p className="text-center text-[12.5px] text-[#8a7e70] italic mt-2.5 leading-relaxed max-w-[85%]">
                              {block.data.caption}
                            </p>
                          )}
                        </div>
                      );
                    } else if (block.type === "raw") {
                      return (
                        <div key={index} className="my-6 raw-html-content" dangerouslySetInnerHTML={{ __html: block.data.html }} />
                      );
                    }
                    return null;
                  })}
              </div>

              {/* End of Story Divider */}
              <div className="flex items-center gap-4 my-16">
                <div className="h-px flex-1 bg-[#e5dfd3]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8a7e70] font-mono">
                  ✦ End of Story ✦
                </span>
                <div className="h-px flex-1 bg-[#e5dfd3]" />
              </div>
            </div>

          </article>
        ) : (
          <div className="flex flex-col justify-center items-center w-full h-[calc(100vh-300px)] gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-[12px] text-[#8a7e70]">Loading story...</p>
          </div>
        )}
      </div>

      {/* Floating sleeker Action Bar (Bottom center - Medium/Substack inspired) */}
      {blogData && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md border border-[#e5dfd3] shadow-lg rounded-full py-3 px-6 flex items-center gap-7 transition-all duration-300 hover:shadow-xl hover:border-[#c84b31]/30">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-[#5a4e40] hover:text-red-500 cursor-pointer transition"
          >
            <Heart size={16} className={isLike ? "fill-red-500 text-red-500" : ""} />
            <span className="text-[11.5px] font-bold">{likes.length}</span>
          </button>

          <div className="w-px h-4 bg-[#e5dfd3]" />

          <button
            onClick={() => dispatch(setIsOpen())}
            className="flex items-center gap-1.5 text-[#5a4e40] hover:text-[#c84b31] cursor-pointer transition"
          >
            <MessageSquare size={16} />
            <span className="text-[11.5px] font-bold">{comments.length}</span>
          </button>

          <div className="w-px h-4 bg-[#e5dfd3]" />

          <button
            onClick={(e) => {
              e.preventDefault();
              handleSaveBlogs(blogData._id, token);
              if (token) {
                setIsBlogSaved((prev) => !prev);
              }
            }}
            className="text-[#5a4e40] hover:text-[#c84b31] cursor-pointer transition"
            title="Save story"
          >
            <Bookmark size={16} className={isBlogSaved ? "fill-[#c84b31] text-[#c84b31]" : ""} />
          </button>

          <div className="w-px h-4 bg-[#e5dfd3]" />

          <button
            onClick={handleShare}
            className="text-[#5a4e40] hover:text-[#c84b31] cursor-pointer transition"
            title="Share link"
          >
            {copiedLink ? <CheckCircle2 size={16} className="text-green-500" /> : <Share2 size={16} />}
          </button>
        </div>
      )}

      {/* sliding Drawer Comment */}
      <AnimatePresence>
        {isOpen && <Comment />}
      </AnimatePresence>
    </div>
  );
}

export default BlogPage;
