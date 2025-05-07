import {configureStore} from "@reduxjs/toolkit"
import UserSlice from "./UserSlice"
import  SelectedBlog  from "./SelectedBlogSlice";
import  commentSlice  from "./commnetSlice";
const Store = configureStore({
    reducer: {
        user: UserSlice,
        SelectedBlog: SelectedBlog,
        comment: commentSlice,
    }
})

export default Store;
