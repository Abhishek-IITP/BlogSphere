import { Route, Routes } from "react-router-dom";
import AuthForm from "./Pages/AuthForm";
import Navbar from "./Components/Navbar";
import HomePage from "./Components/HomePage";
import BlogPage from "./Pages/BlogPage";
import AddBlog from "./Pages/AddBlog";
import VerifyUser from "./Components/VerifyUser";

function App() {
  return (
    // <div className=" w-screen h-fit  ">
      <Routes>
        <Route path="/" element={<Navbar/>} >
        <Route path="/" element={<HomePage/>} ></Route>
        <Route path="/signin" element={<AuthForm type={"signin"} />} ></Route>
        <Route path="/signup" element={<AuthForm type={"signup"} />} ></Route>
        <Route path="/add-blog" element={<AddBlog/>} ></Route>
        <Route path="/blog/:id" element={<BlogPage/>} ></Route>
        <Route path="/edit/:id" element={<AddBlog/>} ></Route>
        <Route path="/verify-email/:verificationToken" element={<VerifyUser/>} ></Route>
        
        </Route>
      </Routes>
    // </div>
  );
}

export default App;
