import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { addSelectedBlog, changeLikes, removeSelectedBlog } from '../Utils/SelectedBlogSlice';
import { setIsOpen } from '../Utils/commnetSlice';
import Comment from '../Components/Comment';
import { formatDate } from '../Utils/formateDate';
import { updateData } from '../Utils/UserSlice';

// Function to calculate read time
function calculateReadTime(content) {
  if (!content || !content.blocks) return 0;
  
  // Count words in all text blocks
  const wordCount = content.blocks.reduce((count, block) => {
    if (block.type === 'paragraph' || block.type === 'header') {
      // Remove HTML tags and count words
      const text = block.data.text.replace(/<[^>]*>/g, '');
      return count + text.split(/\s+/).length;
    }
    return count;
  }, 0);

  // Average reading speed (words per minute)
  const wordsPerMinute = 100;
  
  // Calculate minutes and round up
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return readTime;
}

export async function handleSaveBlogs(id, token) {
  if(token){
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
  
      dispatch(addSelectedBlog(blog));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
  else{
    toast.error("Please SignIn...!!!")
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
      toast.error(error.response.data.message);
    }
  }


function BlogPage()  {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBlogSaved, setIsBlogSaved] = useState(false);
  const [readTime, setReadTime] = useState(0);

  const { token, email, id: userId , profilePicture,username, following } = useSelector((state) => state.user);
  const { likes, comments, content, creator } = useSelector((state) => state.SelectedBlog);
  const { isOpen } = useSelector((state) => state.comment);

  const [blogData, setBlogData] = useState(null);
  const [isLike, setIsLike] = useState(false);

  async function fetchBlogsById() {
    try {
      let { data: { blog } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
      setBlogData(blog);
      setIsBlogSaved(blog?.totalSaves?.includes(userId));
      dispatch(addSelectedBlog(blog));
      
      // Calculate read time when blog data is fetched
      if (blog.content) {
        setReadTime(calculateReadTime(blog.content));
      }
      
      if (blog.likes.includes(userId)) {
        setIsLike((prev) => !prev);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleLike() {
    if(token){

      try {
        
        if (token) {
  
            setIsLike((prev) => !prev);
            let res = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(changeLikes(userId));
            toast.success(res.data.message);
        }
  
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while liking the blog.");
    }
    }
      
    else{
      toast.error("Please SigIN")
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

  useEffect(() => {
    fetchBlogsById();
    return () => {
      dispatch(setIsOpen(false));
      if (window.location.pathname !== `/edit/${id}` &&
        window.location.pathname !== `/blog/${id}`) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id]);

  return (
    <div className="max-w-[700px] mx-auto p-5 ">
      {blogData ? (
        <div>
          <h1 className="mt-10 font-bold text-3xl  my-3 sm:text-4xl lg:text-6xl capitalize">
            {blogData.title}
          </h1>

          <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 transition-transform transform hover:scale-[1.01] hover:translate-y-[-2px]">
  {/* Profile Picture */}
  <div className="relative group ">
    <div className="w-14 h-14 rounded-full overflow-hidden cursor-pointer border-4 border-emerald-500 group-hover:border-purple-700 transition-all duration-300 shadow-md">
      <img
        src={
          blogData?.creator?.profilePicture
            ? blogData?.creator?.profilePicture
            : `https://api.dicebear.com/9.x/initials/svg?seed=${blogData.creator.name}`
        }
        alt="profile"
        className="w-full h-full object-cover"
      />
    </div>
    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
  </div>

  {/* User Info */}
  <div className="flex flex-col justify-center ">
    <div className="flex items-center gap-2 mb-1">
      <Link to={`/@${blogData.creator.username}`}>
      <h2 className="text-xl font-bold text-black capitalize hover:underline cursor-pointer drop-shadow-sm">
        {blogData.creator.name}
      </h2>
      </Link>
      {userId !== blogData.creator._id && (
        <button
          onClick={() => handleFollowCreator(blogData.creator._id, token, dispatch)}
          className="text-xs cursor-pointer bg-black text-white px-3 py-1 rounded-full hover:bg-white hover:text-black border transition-all"
        >
          {!following?.includes(blogData.creator._id) ? "Follow" : "Following"}
        </button>
      )}
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
        {readTime} min read
      </span>
      <span>{formatDate(blogData.createdAt)}</span>
      <span>•</span>
      <span className="italic">Author spotlight</span>
    </div>
  </div>
</div>



          <img src={blogData.image} alt="" />

          {token && email === blogData.creator.email && (
            <div className="flex gap-4 mt-5">
              <Link to={"/edit/" + blogData.blogId}>
                <button className="bg-green-400 cursor-pointer px-6 py-2 text-xl rounded hover:bg-green-500 transition">
                  Edit
                </button>
              </Link>
              <button 
                onClick={handleDeleteBlog}
                className="bg-red-500 text-white cursor-pointer px-6 py-2 text-xl rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          )}
          <div className="flex gap-7 mt-4">
            <div className="cursor-pointer flex gap-2 ">
              {isLike ? (
                <i
                  onClick={handleLike}
                  className="fi fi-sr-heart text-red-600 text-3xl mt-1"
                ></i>
              ) : (
                <i
                  onClick={handleLike}
                  className="fi fi-rr-heart text-3xl mt-1"
                ></i>
              )}
              <p className="text-2xl">{likes.length}</p>
            </div>

            <div className="flex gap-2">
              <i
                onClick={() => dispatch(setIsOpen())}
                className="fi fi-sr-comment-alt  cursor-pointer text-3xl mt-1"
              ></i>
              <p className="text-2xl">{comments.length}</p>
            </div>
            <div
              className="flex gap-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleSaveBlogs(blogData._id, token);
                if(token){
                  setIsBlogSaved((prev) => !prev);
                }
              }}
            >
              {isBlogSaved ? (
                <i className="fi fi-sr-bookmark text-3xl mt-1"></i>
              ) : (
                <i className="fi fi-rr-bookmark text-3xl mt-1"></i>
              )}
            </div>
          </div>

          <div className="my-10">
            {
              content?.blocks?.length > 0 &&
            content.blocks.map((block, index) => {
              if (block.type == "header") {
                if (block.data.level == 2) {
                  return (
                    <h2
                      key={index}
                      className="font-bold text-4xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h2>
                  );
                } else if (block.data.level == 3) {
                  return (
                    <h3
                      key={index}
                      className="font-bold text-3xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h3>
                  );
                } else if (block.data.level == 4) {
                  return (
                    <h4
                      key={index}
                      className="font-bold text-2xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h4>
                  );
                }
              } else if (block.type == "paragraph") {
                return (
                  <p
                    key={index}
                    className="my-4"
                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                  ></p>
                );
              } else if (block.type == "image") {
                return (
                  <div className="my-4" key={index}>
                    <img src={block.data.file.url} alt="" />
                    <p className="text-center my-2">{block.data.caption}</p>
                  </div>
                );
              } else if (block.type == "List") {
                if (block.data.style == "ordered") {
                  return (
                    <ol key={index} className="list-decimal my-4">
                      {block.data.items.map((item, index) => (
                        <li key={index}>{item?.content}</li>
                      ))}
                    </ol>
                  );
                } else {
                  return (
                    <ul key={index} className="list-disc my-4">
                      {block.data.items.map((item, index) => (
                        <li key={index}>{item?.content}</li>
                      ))}
                    </ul>
                  );
                }
              }
            })}
          </div>




          
        </div>
      ) : (
        <div className="flex justify-center items-center w-full h-[calc(100vh-500px)]">
          <span className="loader"></span>
        </div>
      )}

      {isOpen && <Comment />}
    </div>

  );

};

export default BlogPage;
