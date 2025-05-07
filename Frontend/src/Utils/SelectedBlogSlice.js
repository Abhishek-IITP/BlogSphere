import { createSlice } from "@reduxjs/toolkit";

const SelectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: JSON.parse(localStorage.getItem("SelectedBlog")) || {},
  reducers: {
    addSelectedBlog(state, action) {
      localStorage.setItem("SelectedBlog", JSON.stringify(action.payload));
      return action.payload;
    },
    removeSelectedBlog(state) {
      localStorage.removeItem("SelectedBlog");
      return {};
    },
    changeLikes(state, action) {
      if (!state.likes) state.likes = [];
      if (state.likes.includes(action.payload)) {
        state.likes = state.likes.filter(id => id !== action.payload);
      } else {
        state.likes.push(action.payload);
      }
    },
    changeSaves(state, action) {
      if (!state.totalSaves) state.totalSaves = [];
      if (state.totalSaves.includes(action.payload)) {
        state.totalSaves = state.totalSaves.filter(id => id !== action.payload);
      } else {
        state.totalSaves.push(action.payload);
      }
    },
    setComments(state, action) {
      if (!state.comments) state.comments = [];
      state.comments = [...state.comments, action.payload];
    },
    setCommentLikes(state, action) {
      const { commentId, userId } = action.payload;
      const comment = state.comments?.find(comment => comment._id === commentId);
      if (comment) {
        if (!comment.likes) comment.likes = [];
        if (comment.likes.includes(userId)) {
          comment.likes = comment.likes.filter(like => like !== userId);
        } else {
          comment.likes.push(userId);
        }
      }
    }
  }
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  changeLikes,
  changeSaves,
  setComments,
  setCommentLikes
} = SelectedBlogSlice.actions;

export default SelectedBlogSlice.reducer;
