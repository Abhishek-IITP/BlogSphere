import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { addSelectedBlog, changeLikes, changeSaves, removeSelectedBlog } from '../Utils/SelectedBlogSlice';
import { setIsOpen } from '../Utils/commnetSlice';
import Comment from '../Components/Comment';
import { formatDate } from '../Utils/formateDate';



// export async function handleFollowCreator(){
    
// }

async function handleSaveBlogClick(token) {
    if (!token) return toast.error("Please login...!!!");

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/save-blog/${blogData._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(changeSaves(userId));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while saving the blog.");
    }
  }
const BlogPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { token, email, id: userId , profilePicture } = useSelector((state) => state.user);
  const { likes, comments, content, totalSaves } = useSelector((state) => state.SelectedBlog);
  const { isOpen } = useSelector((state) => state.comment);

  const isSaved = totalSaves?.includes(userId);
  const [blogData, setBlogData] = useState(null);
  const [isLike, setIsLike] = useState(false);

  async function fetchBlogsById() {
    try {
      const { data: { blog } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
      setBlogData(blog);
      setIsLike(blog.likes.includes(userId));
      dispatch(addSelectedBlog(blog));
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleLike() {
    if (!token) return toast.error("Please login...!!!");

    try {
      setIsLike((prev) => !prev);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(changeLikes(userId));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while liking the blog.");
    }
  }



  useEffect(() => {
    fetchBlogsById();
    return () => {
      dispatch(setIsOpen(false));
      if (window.location.pathname !== `/edit/${id}`) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id]);




  return (
    <>
      <div className='max-w-[700px] bg-[#F7F4ED] mx-auto px-4'>
        {blogData ? (
          <div>
            <h1 className='mt-10 font-bold text-6xl capitalize'>
             {blogData.title}
            </h1>
            <p className='my-5 text-3xl font-semibold capitalize'>
              {blogData.description}
            </p>
                

            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 transition-transform hover:scale-[1.02]">
  {/* Profile Picture */}
  <div className="relative group">
    <div className="w-14 h-14 rounded-full overflow-hidden cursor-pointer border-4 border-emerald-500 group-hover:border-purple-700 transition-all duration-300 shadow-md">
      <img
        src={
          profilePicture
            ? profilePicture
            : `https://api.dicebear.com/9.x/initials/svg?seed=${blogData.creator.name}`
        }
        alt="profile"
        className="w-full h-full object-fit"
      />
    </div>
    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
  </div>

  {/* User Info */}
  <div className="flex flex-col justify-center">
    <div className="flex items-center gap-2 mb-1">
      <h2 className="text-xl font-bold text-black capitalize hover:underline cursor-pointer drop-shadow-sm">
        {blogData.creator.name}
      </h2>
      <button onClick={()=> handleFollowCreator(blogData.creator._id , token)} className="text-xs cursor-pointer bg-black text-white px-3 py-1 rounded-full hover:bg-white hover:text-black border transition-all">
        Follow
      </button>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
      <span className="flex items-center gap-1">
        <svg
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L15 10H22L16.5 14L19 21L12 17L5 21L7.5 14L2 10H9L12 3Z" />
        </svg>
        6 min read
      </span>
      <span>{formatDate(blogData.createdAt)}</span>
      <span>•</span>
      <span className="italic">Author spotlight</span>
    </div>
  </div>
</div>


            <img src={blogData.image} alt="" className='rounded-lg my-4' />

            {token && blogData?.creator?.email === email && (
              <Link to={`/edit/${blogData.blogId}`}>
                <button className='bg-green-400 mt-5 px-6 py-2 text-xl rounded'>
                  Edit
                </button>
              </Link>
            )}

            <div className='flex gap-7 mt-4'>
              <div className='cursor-pointer flex gap-2'>
                {isLike ? (
                  <i onClick={handleLike} className="fi fi-ss-heart text-red-600 text-3xl mt-1"></i>
                ) : (
                  <i onClick={handleLike} className="fi fi-rs-heart text-3xl mt-1"></i>
                )}
                <p className='text-3xl'>{likes?.length || 0}</p>
              </div>
              <div className='cursor-pointer flex gap-2'>
                <i onClick={() => dispatch(setIsOpen())} className="fi fi-sr-comment-alt text-3xl mt-1"></i>
                <p className='text-3xl'>{comments?.length || 0}</p>
              </div>
              <div className='flex gap-2 items-center' onClick={handleSaveBlogClick}>
                {isSaved ? (
                  <i className="fi fi-sr-bookmark cursor-pointer text-3xl"></i>
                ) : (
                  <i className="fi fi-rr-bookmark cursor-pointer text-3xl"></i>
                )}
                <p className='text-3xl'>{totalSaves?.length || 0}</p>
              </div>
            </div>

            <div className='my-10'>
              {content.blocks.map((block, index) => {
                if (block.type === "header") {
                  const Tag = `h${block.data.level}`;
                  return (
                    <Tag
                      key={index}
                      className={`font-bold my-4 text-${5 - block.data.level}xl`}
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                  );
                } else if (block.type === "paragraph") {
                  return (
                    <p key={index} className='my-4' dangerouslySetInnerHTML={{ __html: block.data.text }} />
                  );
                } else if (block.type === "image") {
                  return (
                    <div key={index} className='my-4 text-center'>
                      <img src={block.data.file.url} alt="" className='mx-auto' />
                      <p className='text-center my-2'>{block.data.caption}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ) : (
          <h1 className='text-3xl font-semibold mt-10'>Loading...</h1>
        )}
      </div>

      {isOpen && <Comment />}
    </>
  );
};

export default BlogPage;
