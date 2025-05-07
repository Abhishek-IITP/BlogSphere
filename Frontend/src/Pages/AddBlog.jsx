import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import NestedList from '@editorjs/nested-list';
import CodeTool from '@editorjs/code';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Embed from '@editorjs/embed';
import RawTool from '@editorjs/raw';
import TextVariantTune from '@editorjs/text-variant-tune';
import Table from '@editorjs/table'
import ImageTool from '@editorjs/image';
import { setIsOpen } from "../Utils/commnetSlice";
import { removeSelectedBlog } from "../Utils/SelectedBlogSlice";

const AddBlog = () => {
  const { id } = useParams();
  const editorjsRef= useRef(null);
  
  const formData= new FormData();
  const navigate = useNavigate();
  const dispatch = useDispatch();

const {token}= useSelector(slice=>slice.user)
const {title, description, image, content}= useSelector(slice => slice.SelectedBlog)

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: ""
    // draft: false,
  });
  async function handlePostBlog() {
    formData.append("title", blogData.title)
    formData.append("description", blogData.description)
    formData.append("image", blogData.image)
    formData.append("content", JSON.stringify(blogData.content)); 
    blogData.content.blocks.forEach((block)=>{
      if(block.type=='image'){
        formData.append("images", block.data.file.image)
      }
    })
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      toast.success(res.data.message);

      navigate("/");
    } catch (error) {
        console.log(error)
      toast.error(error?.response?.data?.message);
    }
  }
  async function handleUpdateBlog() {
    const formData = new FormData();
    formData.append("title" , blogData.title)
    formData.append("description" , blogData.description)
    formData.append("image" , blogData.image)
    formData.append("content" , JSON.stringify(blogData.content))


    let existingImages= [];
    blogData.content.blocks.forEach((block)=>{
      if(block.type=='image'  ){
        if(block.data.file.image){
          formData.append("images", block.data.file.image)
        }
        else{
          existingImages.push({
            url: block.data.file.url,
            imageId: block.data.file.imageId,
          })
        }
      }
      
    })

    for(let data of formData.entries()){
      console.log(data);
    }
    formData.append("existingImages", JSON.stringify(existingImages))

    try {
      const res = await axios.patch(
        `http://localhost:3000/api/v1/blogs/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      toast.success(res.data.message || "Blog updated successfully");
      navigate("/"); 
    } catch (error) {
      console.log("ERROR in update:", error);
  
      if (error.response) {
        const message = error.response.data.message || "Something went wrong";
        toast.error(message); // this will now correctly catch 403 etc.
      } else {
        toast.error("Network error or server not responding");
      }
    }
  }

  async function fetchBlogsById() {
    try {
        // let res= await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)
        // setBlogData(
        //     {
        //         title: res.data.blog.title,
        //         description: res.data.blog.description,
        //         image: res.data.blog.image
        //     }
        // )            
    // console.log(res)

          setBlogData(
            {
                title: title,
                description: description,
                image: image,
                content
            })
        
    } catch (error) {
        toast.error(error.response.data.message)       
    }
}
function intilizeEditorjs(){
  editorjsRef.current= new EditorJS({
    holder : "editorjs",
    placeholder : "Write Something....",
    data: content,
    tools: {
      header : {
        class: Header,
        inlineToolbar: true,
        config:{
          placeholder: "Enter Your Heading...",
          levels: [2,3,4],
          defaultLevel: 3,
        },
      },
      List : {
        class : NestedList,
        config: {

        },
        inlineToolbar: true,
      },
      code: CodeTool,
      Marker : Marker,
      Underline: Underline,
     embed: Embed,
     raw: RawTool,
     textVariant: TextVariantTune,
     image: {
      class:ImageTool,
      config:{
        uploader:{
          uploadByFile: async(image)=>{
              return {
                success: 1,
                file: {
                  url: URL.createObjectURL(image),
                  image
                }
              };

          },
        }
      }


     },
     table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
        maxRows: 5,
        maxCols: 5,
      },
    },
    },
    tunes: ['textVariant'],
    onChange: async()=>{
      let data = await editorjsRef.current.save()
      setBlogData((blogData)=>({...blogData, content: data}))
       
    }
  })
}

    useEffect(()=>{
        if(id){
            fetchBlogsById();
        }
    },[id])

    useEffect(()=>{
      if(editorjsRef.current===null){
        intilizeEditorjs();
      }

      // return()=>{
        // }
        return()=>{
          dispatch(setIsOpen(false))
          editorjsRef.current= null;
        if(window.location.pathname !== `/edit/${id}`){  
            dispatch(removeSelectedBlog())

        }
    }

    }, [])

  return token == null ? (
    <Navigate to="/signin" />
  ) :(
    <div className="w-[620px] mx-auto">

<div className=" my-4">
<h2 className="text-2xl font-semibold my-2">Title</h2>
<input
      className="bg-gray-50 border drop-shadow-xl border-gray-200 w-1/2 focus:outline-none rounded-lg p-2 placeholder:text-lg capitalize"
      type="text"
        placeholder="title"
        onChange={(e) =>
          setBlogData((blogData) => ({ ...blogData, title: e.target.value }))
        }
        value={blogData.title}
        
      />
        </div>

      <div className="my-4">
      <h2 className="text-2xl font-semibold my-2">Description</h2>
   
          <textarea type="text" placeholder="description"  className='resize-none h-[150px] border 
    border-gray-200 drop-shadow-2xl w-full p-4 text-lg focus:outline-none placeholder:text-lg capitalize'
    // <input
    // className="bg-amber-50 " 

    //   type="text"
      
      
    //   value={blogData.description}
    // />
    onChange={(e) =>
      setBlogData((blogData) => ({
        ...blogData,
        description: e.target.value,
      }))
    } />
      </div>
    

      <div>
      <h2 className="text-2xl font-semibold my-2">Image</h2>

        <label htmlFor="image">
          {blogData.image ? (
            <img
              src={typeof(blogData.image)=== "string"? blogData.image:URL.createObjectURL(blogData.image)}
              alt=""
              className="aspect-video border-gray-200 border rounded-xl object-cover"
            />
          ) : (
            <div className="bg-white border-gray-400 border rounded-xl aspect-video flex justify-center items-center text-4xl opacity-40">
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

      <div className="my-4">
      <h2 className="text-2xl font-semibold my-2">Content</h2>
      <div className=" min-h-10" id="editorjs"></div>
      </div>

      <button className="bg-green-500 my-6  rounded-full font-semibold hover:bg-green-600 cursor-pointer transition-all text-lg py-4 px-7 text-white" onClick={id?handleUpdateBlog:handlePostBlog}>{id?"Update Blog":"Post Blog"}</button>
    </div>
  );
};

export default AddBlog;
