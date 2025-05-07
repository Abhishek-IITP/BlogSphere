import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOpen } from '../Utils/commnetSlice';
import axios from 'axios';
import { setCommentLikes, setComments } from '../Utils/SelectedBlogSlice';
import { formatDate } from '../Utils/formateDate';
import toast from 'react-hot-toast';

const Comment = () => {
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');

  const { _id: blogId, comments } = useSelector((state) => state.SelectedBlog);
  const { token, id: userId } = useSelector((state) => state.user);

  async function handleComment() {
    if (!comment.trim()) return toast.error("Comment can't be empty!");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(setComments(res.data.newComment));
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || "Error posting comment");
    }
  }

  async function handleCommentLike(commentId) {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      toast.error("Couldn't like comment");
    }
  }

  return (
<div className='fixed top-[71px] right-0 w-[400px] h-[calc(100vh-80px)] bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-scroll transition-all duration-300 ease-in-out'>
  <div className='p-5'>
    <div className='flex justify-between items-center'>
      <h1 className='text-xl font-semibold text-gray-800'>Comments ({comments.length})</h1>
      <i onClick={() => dispatch(setIsOpen(false))} className="fi fi-rr-cross-circle text-2xl text-gray-500 hover:text-red-500 cursor-pointer transition" />
    </div>

    <textarea
      className='w-full mt-4 h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none'
      placeholder='Write your comment...'
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
    <button
      onClick={handleComment}
      className='bg-green-500 text-white py-2 px-6 rounded-full mt-3 hover:bg-green-600 transition font-medium'
    >
      Post Comment
    </button>

    <div className='mt-6 space-y-6'>
      {comments.map((comment, index) => (
        <div key={index} className='border-b pb-4'>
          <div className='flex items-start gap-3'>
            {comment.user ? (
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${comment.user.name}`}
                alt="user"
                className='w-10 h-10 rounded-full'
              />
            ) : (
              <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold'>
                ?
              </div>
            )}
            <div className='flex-1'>
              <div className='flex justify-between items-center'>
                <p className='font-semibold capitalize text-gray-800'>
                  {comment.user?.name || 'Deleted User'}
                </p>
                <span className='text-sm text-gray-500'>{formatDate(comment.createdAt)}</span>
              </div>
              <p className='mt-1 text-gray-700'>{comment.comment}</p>
              <div className='flex items-center gap-2 mt-2'>
                {comment.likes.includes(userId) ? (
                  <i onClick={() => handleCommentLike(comment._id)} className="fi fi-ss-heart text-red-500 text-lg cursor-pointer"></i>
                ) : (
                  <i onClick={() => handleCommentLike(comment._id)} className="fi fi-rs-heart text-gray-500 text-lg cursor-pointer hover:text-red-400 transition"></i>
                )}
                <span className='text-gray-600 text-sm'>{comment.likes.length}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  );
};

export default Comment;
