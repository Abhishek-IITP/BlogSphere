import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import "../App.css";

const CreateBlogs = () => {
  let user = JSON.parse(localStorage.getItem("token"));
  console.log("user token:", user);

  if (!user || !user.token) {
    return <Navigate to="/signup" />;
  }

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
  });

  async function handleSubmit() {
    if (!blogData.title || !blogData.description) {
      setError("Both title and description are required.");
      return;
    }
    let response = await fetch("http://localhost:3000/api/v1/blogs", {
      method: "POST",
      body: JSON.stringify(blogData),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
    let res = await response.json();
    alert(res.message);
    console.log(res.message);
  }

  return (
    <div>
      <h1>Create Blogs</h1>
      <div>
        <input
          onChange={(e) =>
            setBlogData((prev) => ({ ...prev, title: e.target.value }))
          }
          type="text"
          placeholder="Title"
          required
        />
        <br />
        <br />
        <input
          onChange={(e) =>
            setBlogData((prev) => ({ ...prev, description: e.target.value }))
          }
          type="text"
          placeholder="Description"
          required
        />
        <br />
      </div>
      <br />
      <button onClick={handleSubmit}>Create Blog</button>
    </div>
  );
};

export default CreateBlogs;
