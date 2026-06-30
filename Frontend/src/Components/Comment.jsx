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
import { motion } from 'framer-motion';
import { X, Heart, MessageSquare, MoreHorizontal, CornerDownRight, Edit2, Trash2 } from 'lucide-react';

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
    if (!comment.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }
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
      toast.success("Comment posted!");
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error posting comment');
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-full sm:w-[450px] h-screen bg-[#faf7f2]/98 backdrop-blur-md border-l border-[#e5dfd3] shadow-2xl z-[100] flex flex-col font-['Outfit']"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#e5dfd3] flex justify-between items-center bg-white/40">
        <div>
          <h1 className="text-[18px] font-serif font-black text-[#1e1b18]">
            Responses
          </h1>
          <p className="text-[12px] text-[#8a7e70] font-medium mt-0.5">
            {comments.length} {comments.length === 1 ? 'thought' : 'thoughts'} on this story
          </p>
        </div>
        <button
          onClick={() => dispatch(setIsOpen(false))}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white hover:bg-red-50 text-[#8a7e70] hover:text-red-500 border border-[#e5dfd3] transition cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Editor Box */}
      <div className="p-6 border-b border-[#e5dfd3] bg-white/20">
        {token ? (
          <div className="flex flex-col">
            <textarea
              className="w-full h-24 p-3 bg-white border border-[#e5dfd3] rounded-2xl text-[13px] text-[#1e1b18] placeholder-[#a09890] focus:outline-none focus:border-[#c84b31] resize-none transition shadow-sm"
              placeholder="What are your thoughts?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleComment}
                className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[12.5px] font-bold py-2 px-5 rounded-full shadow-sm hover:shadow transition duration-200 cursor-pointer"
              >
                Respond
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-white/40 border border-dashed border-[#e5dfd3] rounded-2xl">
            <p className="text-[12.5px] text-[#8a7e70] mb-2.5">Sign in to leave a response</p>
            <Link to="/signin" onClick={() => dispatch(setIsOpen(false))}>
              <button className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[11px] font-bold px-4 py-1.5 rounded-full transition cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Scrollable Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
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
          ))
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <MessageSquare size={26} className="text-[#a09890] mb-3" />
            <p className="text-[14px] font-serif font-bold text-[#5a4e40]">No responses yet</p>
            <p className="text-[11.5px] text-[#a09890] mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </motion.div>
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
    if (!reply.trim()) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/comment/${parentCommentId}/${blogId}`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply('');
      setActiveReply(null);
      dispatch(setReplies(res.data.newReply));
      toast.success("Reply posted!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error posting reply");
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!token) {
      toast.error("Please Sign In to like!");
      return;
    }
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error liking comment");
    }
  };

  const handleCommentUpdate = async (id) => {
    if (!updatedCommentContent.trim()) return;
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${id}`,
        { updatedCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error editing comment");
    } finally {
      setUpdatedCommentContent('');
      setCurrentEditComment(null);
    }
  };

  const handleCommentDelete = async (id) => {
    if (window.confirm("Delete this response?")) {
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(res.data.message);
        dispatch(deleteCommentAndReply(id));
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting comment");
      }
    }
  };

  const isLikedByMe = comment?.likes?.includes(userId);

  return (
    <div className="py-4 border-b border-[#e5dfd3]/50 last:border-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link to={`/@${comment.user?.username}`} className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5dfd3]">
            <img
              src={
                comment.user?.profilePicture ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${comment.user?.name || 'User'}`
              }
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Content Box */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center text-[12.5px]">
            <Link to={`/@${comment.user?.username}`} className="font-bold text-[#1e1b18] hover:text-[#c84b31] transition capitalize">
              {comment.user?.name || 'Deleted User'}
            </Link>
            <span className="text-[#a09890]">{formatDate(comment.createdAt)}</span>
          </div>

          {currentEditComment === comment._id ? (
            <div className="mt-2">
              <textarea
                className="w-full p-2.5 bg-white border border-[#e5dfd3] rounded-xl text-[12.5px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] resize-none transition"
                defaultValue={comment.comment}
                onChange={(e) => setUpdatedCommentContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleCommentUpdate(comment._id)}
                  className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setCurrentEditComment(null)}
                  className="text-[#8a7e70] hover:text-black text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-[13.5px] text-[#2c2621] leading-relaxed break-words">
              {comment.comment}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-4 mt-2.5 text-[11.5px] text-[#8a7e70] font-bold">
            <button
              onClick={() => handleCommentLike(comment._id)}
              className={`flex items-center gap-1 cursor-pointer transition ${
                isLikedByMe ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <Heart size={12} className={isLikedByMe ? 'fill-red-500 text-red-500' : ''} />
              <span>{comment.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => setActiveReply(activeReply === comment._id ? null : comment._id)}
              className="hover:text-[#c84b31] transition cursor-pointer"
            >
              Reply
            </button>

            {/* Edit/Delete Dots Menu */}
            {(comment.user?._id === userId || userId === creatorId) && (
              <div className="relative ml-auto">
                <button
                  onClick={() =>
                    setCurrentPopup(currentPopup === comment._id ? null : comment._id)
                  }
                  className="hover:text-black transition cursor-pointer"
                >
                  <MoreHorizontal size={14} />
                </button>

                {currentPopup === comment._id && (
                  <div className="absolute right-0 mt-1 w-24 bg-white border border-[#e5dfd3] shadow-md rounded-xl text-[11.5px] z-20 overflow-hidden font-bold py-1">
                    {comment.user?._id === userId && (
                      <button
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#faf7f2] hover:text-[#c84b31] flex items-center gap-1.5 cursor-pointer text-[#5a4e40]"
                        onClick={() => {
                          setCurrentEditComment(comment._id);
                          setCurrentPopup(null);
                        }}
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                    )}
                    <button
                      className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 hover:text-red-500 flex items-center gap-1.5 cursor-pointer text-red-400"
                      onClick={() => {
                        handleCommentDelete(comment._id);
                        setCurrentPopup(null);
                      }}
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reply Form */}
          {activeReply === comment._id && (
            <div className="mt-3">
              <textarea
                className="w-full p-2.5 bg-white border border-[#e5dfd3] rounded-xl text-[12.5px] text-[#1e1b18] placeholder-[#a09890] focus:outline-none focus:border-[#c84b31] resize-none transition"
                placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleReply(comment._id)}
                  className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full cursor-pointer"
                >
                  Reply
                </button>
                <button
                  onClick={() => setActiveReply(null)}
                  className="text-[#8a7e70] hover:text-black text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies Thread */}
          {comment.replies?.length > 0 && (
            <div className="pl-3 mt-4 border-l-2 border-[#e5dfd3]/50 space-y-4">
              {comment.replies.map((replyComment) => (
                <div key={replyComment._id} className="flex gap-1.5 items-start">
                  <CornerDownRight size={12} className="text-[#a09890] mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CommentCard
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;