import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOpen } from '../Utils/commnetSlice';
import axios from 'axios';
import {
  deleteCommentAndReply,
  setCommentLikes,
  setComments,
  setReplies,
  setUpdatedComments,
} from '../Utils/SelectedBlogSlice';
import { formatDate } from '../Utils/formateDate';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function Comment() {
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');
  const [activeReply, setActiveReply] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentEditComment, setCurrentEditComment] = useState(null);

  const {
    _id: blogId,
    comments,
    creator: { _id: creatorId },
  } = useSelector((state) => state.SelectedBlog);
  const { token, id: userId } = useSelector((state) => state.user);

  async function handleComment() {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComment('');
      dispatch(setComments(res.data.newComment));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error posting comment');
    }
  }

  return (
   
    <div className="fixed top-[71px] right-0 w-full sm:min-w-[430px] sm:w-[400px] h-[calc(100vh-71px)] bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto transition-all duration-300 ease-in-out font-['Segoe_UI']">
    <div className="p-5">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h1>
        <i
          onClick={() => dispatch(setIsOpen(false))}
          className="fi fi-rr-cross-circle text-2xl text-gray-500 hover:text-red-500 cursor-pointer transition"
        />
      </div>
  
      {/* Textarea */}
      <textarea
        className="w-full mt-4 h-28 p-3 border border-gray-300 rounded-xl shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none transition"
        placeholder="Write your comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
  
      {/* Button */}
      <button
        onClick={handleComment}
        className="bg-green-500 text-white py-2 px-6 rounded-full mt-3 font-medium hover:bg-green-600 active:scale-95 transition transform cursor-pointer"
      >
        Post Comment
      </button>
  
      {/* Comment List */}
      <div className="mt-6 space-y-6">
        {comments.map((comment, index) => (
          <CommentCard
            key={index}
            comment={comment}
            userId={userId}
            blogId={blogId}
            token={token}
            activeReply={activeReply}
            setActiveReply={setActiveReply}
            currentPopup={currentPopup}
            setCurrentPopup={setCurrentPopup}
            currentEditComment={currentEditComment}
            setCurrentEditComment={setCurrentEditComment}
            creatorId={creatorId}
          />
        ))}
      </div>
    </div>
  </div>
  
  );
  
}

function CommentCard({
  comment,
  userId,
  blogId,
  token,
  activeReply,
  setActiveReply,
  currentPopup,
  setCurrentPopup,
  currentEditComment,
  setCurrentEditComment,
  creatorId,
}) {
  const dispatch = useDispatch();
  const [reply, setReply] = useState('');
  const [updatedCommentContent, setUpdatedCommentContent] = useState('');

  const handleReply = async (parentCommentId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/comment/${parentCommentId}/${blogId}`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply('');
      setActiveReply(null);
      dispatch(setReplies(res.data.newReply));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleCommentUpdate = async (id) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${id}`,
        { updatedCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setUpdatedCommentContent('');
      setCurrentEditComment(null);
    }
  };

  const handleCommentDelete = async (id) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(deleteCommentAndReply(id));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const { username } = useSelector((state) => state.user);

  return (
    <div className="py-6 border-b border-gray-100">
      <div className="flex items-start gap-4">

          {comment.user && comment.user.profilePicture ? (
  <img
    src={comment.user.profilePicture}
    alt="user"
    className="w-9 h-9 rounded-full"
  />
) : (
  <img
    src={`https://api.dicebear.com/9.x/initials/svg?seed=${comment.user?.name || 'User'}`}
    alt="user"
    className="w-9 h-9 rounded-full"
  />
)}


        <div className="flex-1">
          <div className="flex justify-between items-center text-sm">
            <Link to={`/@${username}`}>
            <span className="text-gray-900 font-medium capitalize">
              {comment.user?.name || 'Deleted User'}
            </span>
            </Link>
            <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
  
          <p className="mt-2 text-[15px] text-gray-800 leading-relaxed">
            {comment.comment}
          </p>
  
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <button
              onClick={() => handleCommentLike(comment._id)}
              className="flex items-center cursor-pointer gap-1 hover:text-red-500 transition"
            >
              {comment?.likes?.includes(userId) ? (
                <i className="fi fi-ss-heart text-red-500"></i>
              ) : (
                <i className="fi fi-rs-heart"></i>
              )}
              <span>{comment.likes.length}</span>
            </button>
  
            <button
              onClick={() => setActiveReply(activeReply === comment._id ? null : comment._id)}
              className="hover:underline cursor-pointer hover:text-blue-600 transition"
            >
              Reply
            </button>
  
            {(comment.user?._id === userId || userId === creatorId) && (
              <div className="relative">
                <button
                  onClick={() =>
                    setCurrentPopup(currentPopup === comment._id ? null : comment._id)
                  }
                >
                  <i className="fi fi-br-menu-dots cursor-pointer text-gray-500 hover:text-gray-800"></i>
                </button>
  
                {currentPopup === comment._id && (
                  <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow-sm rounded-md text-sm z-20">
                    {comment.user._id === userId && (
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setCurrentEditComment(comment._id)}
                      >
                        Edit
                      </div>
                    )}
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCommentDelete(comment._id)}
                    >
                      Delete
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
  
          {currentEditComment === comment._id && (
            <div className="mt-4">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                defaultValue={comment.comment}
                onChange={(e) => setUpdatedCommentContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleCommentUpdate(comment._id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setCurrentEditComment(null)}
                  className="text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
  
          {activeReply === comment._id && (
            <div className="mt-4">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <button
                onClick={() => handleReply(comment._id)}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
              >
                Reply
              </button>
            </div>
          )}
  
          {comment.replies?.length > 0 && (
            <div className="pl-6 mt-6 border-l border-gray-200">
              {comment.replies.map((replyComment) => (
                <CommentCard
                  key={replyComment._id}
                  comment={replyComment}
                  userId={userId}
                  blogId={blogId}
                  token={token}
                  activeReply={activeReply}
                  setActiveReply={setActiveReply}
                  currentPopup={currentPopup}
                  setCurrentPopup={setCurrentPopup}
                  currentEditComment={currentEditComment}
                  setCurrentEditComment={setCurrentEditComment}
                  creatorId={creatorId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}

export default Comment;