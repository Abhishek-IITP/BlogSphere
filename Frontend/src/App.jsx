import { Route, Routes } from "react-router-dom";
import "./App.css";
import Signup from "./Pages/Signup";
import Blogs from "./Components/Blogs";
import SignIn from "./Pages/SignIn";
import CreateBlogs from "./Components/CreateBlogs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Blogs />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/signin" element={<SignIn />}></Route>
      <Route path="/Create-blogs" element={<CreateBlogs />}></Route>
      <Route
        path="*"
        element={<h1>Kya baat h sheer tu idhar bhi aa gya</h1>}
      ></Route>
    </Routes>
  );
}

export default App;
