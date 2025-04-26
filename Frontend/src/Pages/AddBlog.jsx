import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const AddBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();


  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
  });
  async function handlePostBlog() {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        blogData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    //   console.log(res);
      toast.success(res.data.message);

      navigate("/");
    } catch (error) {
        // console.log(error)
      toast.error(error?.response?.data?.message);
    }
  }
  async function handleUpdateBlog() {
    try {
      const res = 
      await axios.patch(`http://localhost:3000/api/v1/blogs/${id}`, blogData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
    //   console.log(res);
    toast.success(response.data.message || "Blog updated successfully");

    }catch (error) {
        console.log(error);
      
        // check this block is actually hit
        if (error.response) {
          const message = error.response.data.message || "Something went wrong";
          toast.error(message); // <-- this should trigger toast for 403 too
        } else {
          toast.error("Network error or server not responding");
        }
      }
      
  }

  async function fetchBlogsById() {
    try {
        let res= await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)
        setBlogData(
            {
                title: res.data.blog.title,
                description: res.data.blog.description,
                image: res.data.blog.image
            }
        )            
    // console.log(res)
        
    } catch (error) {
        toast.error(error.response.data.message)       
    }
}
    useEffect(()=>{
        if(id){
            fetchBlogsById();
        }
    },[])

  const token = JSON.parse(localStorage.getItem("token"));
  return token == null ? (
    <Navigate to="/signin" />
  ) :(
    <div className="w-[500px]">
      <label htmlFor="">Title</label>
      <input
      className="bg-amber-50"
      type="text"
        placeholder="title"
        onChange={(e) =>
          setBlogData((blogData) => ({ ...blogData, title: e.target.value }))
        }
        value={blogData.title}
      />
      <br />
      <label htmlFor="">Description</label>
      <input
      className="bg-amber-50 " 

        type="text"
        placeholder="description"
        onChange={(e) =>
          setBlogData((blogData) => ({
            ...blogData,
            description: e.target.value,
          }))
        }
        value={blogData.description}
      />
      <br />

      <div>
        <label htmlFor="image">
          {blogData.image ? (
            <img
              src={typeof(blogData.image)=== "string"? blogData.image:URL.createObjectURL(blogData.image)}
              alt=""
              className="aspect-video object-cover"
            />
          ) : (
            <div className="bg-slate-500 aspect-video flex justify-center items-center text-4xl">
              <h1>select image</h1>
            </div>
          )}
        </label>
        <input
          className="hidden"
          id="image"
          type="file"
          accept=".png , .jpeg ,jpg"
          onChange={(e) =>
            setBlogData((blogData) => ({
              ...blogData,
              image: e.target.files[0],
            }))
          }
        />
      </div>

      <br />
      <button onClick={id?handleUpdateBlog:handlePostBlog}>{id?"Update Blog":"Post Blog"}</button>
    </div>
  );
};

export default AddBlog;
