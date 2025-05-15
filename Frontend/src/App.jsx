import { Route, Routes } from "react-router-dom";
import AuthForm from "./Pages/AuthForm";
import Navbar from "./Components/Navbar";
import HomePage from "./Components/HomePage";
import BlogPage from "./Pages/BlogPage";
import AddBlog from "./Pages/AddBlog";
import VerifyUser from "./Components/VerifyUser";
import ProfilePage from "./Pages/ProfilePage";
import EditProfile from "./Pages/EditProfile";
import Setting from "./Components/Setting";
import SearchBlogs from "./Components/SearchBlogs";

function App() {
  return (

      <Routes>
        <Route path="/" element={<Navbar/>} >
        <Route path="/" element={<HomePage/>} ></Route>
        <Route path="/signin" element={<AuthForm type={"signin"} />} ></Route>
        <Route path="/signup" element={<AuthForm type={"signup"} />} ></Route>
        <Route path="/add-blog" element={<AddBlog/>} ></Route>
        <Route path="/blog/:id" element={<BlogPage/>} ></Route>
        <Route path="/edit/:id" element={<AddBlog/>} ></Route>
        <Route path="/verify-email/:verificationToken" element={<VerifyUser/>} ></Route>
        <Route path="/edit-profile" element={<EditProfile/>} />
        <Route path="/search" element={<SearchBlogs/>} ></Route>
        <Route path="/tag/:tag" element={<SearchBlogs/>} ></Route>
        <Route path="/:username" element={<ProfilePage/>} ></Route>
        <Route path="/:username/saved-blogs" element={<ProfilePage/>} ></Route>
        <Route path="/:username/liked-blogs" element={<ProfilePage/>} ></Route>
        <Route path="/:username/draft-blogs" element={<ProfilePage/>} ></Route>
        <Route path="/setting" element={<Setting/>} ></Route>
      
        </Route>
      </Routes>
  );
}

export default App;
