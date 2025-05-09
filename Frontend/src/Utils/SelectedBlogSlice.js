import { createSlice } from "@reduxjs/toolkit";

const SelectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: JSON.parse(localStorage.getItem("SelectedBlog")) || {
    creator : { _id : ""},
    likes: [],
    comments: [],
  },
  reducers: {
    addSelectedBlog(state, action) {
      localStorage.setItem("SelectedBlog", JSON.stringify(action.payload));
      return action.payload;
    },
    removeSelectedBlog(state,action) {
      localStorage.removeItem("SelectedBlog");
      return {};
    },
    changeLikes(state, action) {
      if (state.likes.includes(action.payload)) {
        state.likes = state.likes.filter((like) => like !== action.payload);
      } else {
        state.likes = [...state.likes , action.payload];
      }
      localStorage.setItem("SelectedBlog", JSON.stringify(state));
      return state;
    },
    setComments(state, action) {
      state.comments = [...state.comments, action.payload];
      localStorage.setItem("SelectedBlog", JSON.stringify(state));
    },
    setCommentLikes(state, action) {
      // let { commentId, userId } = action.payload;
      // function toogleLike(comments){
      //   return comments.map((commnet)=>{
      //     if(comment._id == commentId){
      //       if(comment.likes.includes(userId)){
      //         return comment;
      //       }
      //       else{
      //         comment.likes = [...comment.likes, userId]
      //       }
      //     }

      //   })
      // }
      const { commentId, userId } = action.payload;
      const comment = state.comments?.find(comment => comment._id === commentId);
      if (comment) {
        if (!comment.likes) comment.likes = [];
        if (comment.likes.includes(userId)) {
          comment.likes = comment.likes.filter(like => like !== userId);
        } else {
          comment.likes.push(userId);
        }
        localStorage.setItem("SelectedBlog", JSON.stringify(state));
      }
    },


    changeSaves(state, action) {
      if (!state.totalSaves) state.totalSaves = [];
      if (state.totalSaves.includes(action.payload)) {
        state.totalSaves = state.totalSaves.filter(id => id !== action.payload);
      } else {
        state.totalSaves.push(action.payload);
      }
      localStorage.setItem("SelectedBlog", JSON.stringify(state));
    },
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
