import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
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
import useLoader from "../Hooks/useLoader"

const AddBlog = () => {
  const { id } = useParams();
  const editorjsRef= useRef(null);
  const [isLoading, startLoading, stopLoading] = useLoader();
  const formData= new FormData();
  const {token}= useSelector(slice=>slice.user)
  const {title, description, image, content,draft,tags}= useSelector(slice => slice.SelectedBlog)
  
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
    tags: [],
    draft: false,
  });


  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handlePostBlog() {
    formData.append("title", blogData.title)
    formData.append("description", blogData.description)
    formData.append("image", blogData.image)
    formData.append("content", JSON.stringify(blogData.content)); 
    formData.append("tags", JSON.stringify(blogData.tags));
    formData.append("draft", blogData.draft);

    blogData.content.blocks.forEach((block)=>{
      if(block.type ==='image'){
        formData.append("images", block.data.file.image)
      }
    })
    try {
      startLoading();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
        console.log(error)
      toast.error(error.response.data.message);
    } finally{
      stopLoading();
    }
  }
  async function handleUpdateBlog() {
    let formData = new FormData();
    formData.append("title" , blogData.title)
    formData.append("description" , blogData.description)
    formData.append("image" , blogData.image)
    formData.append("content" , JSON.stringify(blogData.content))
    formData.append("tags", JSON.stringify(blogData.tags));
    formData.append("draft", blogData.draft);

    let existingImages= [];
    blogData.content.blocks.forEach((block)=>{
      if(block.type==='image'  ){
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
    formData.append("existingImages", JSON.stringify(existingImages))
    console.log(formData)

    try {
      startLoading();
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/` + id,
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
      toast.error(error.response.data.message);
    } finally{
      stopLoading()
    }
  }

  async function fetchBlogsById() {
    try {
          setBlogData(
            {
                title: title,
                description: description,
                image: image,
                content: content,
                draft: draft,
                tags: tags,
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
        config: {},
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
                  image,
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

function handleKeyDown(e) {
  const tag = e.target.value.toLowerCase();

  if (e.code === "Space" || e.keyCode == "32") {
    e.preventDefault();
  }

  if ((e.code == "Enter" || e.keyCode == "13") && tag !== "") {
    if (blogData.tags.length >= 10) {
      e.target.value = "";
      return toast.error("You can add upto maximum 10 tags");
    }
    if (blogData.tags.includes(tag)) {
      e.target.value = "";
      return toast.error("This tag already added");
    }
    setBlogData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    e.target.value = "";
  }
}

function deleteTag(index) {
  const updatedTags = blogData.tags.filter(
    (_, tagIndex) => tagIndex !== index
  );
  setBlogData((prev) => ({ ...prev, tags: updatedTags }));
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

        return()=>{
          editorjsRef.current= null;
          dispatch(setIsOpen(false))
        if(window.location.pathname !== `/edit/${id}`){  
            dispatch(removeSelectedBlog())
        }
    }

    }, [])

return token == null ? (
  <Navigate to="/signin" />
) : (
  <div style={{fontFamily:"sans-serif"}} className="max-w-4xl px-6 py-12 mx-auto  text-[#1A1A1A]">
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Image Upload Section */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-[1.3rem] font-semibold mb-3">Cover Image</h2>
        <label htmlFor="image" className="block cursor-pointer group">
          {blogData.image ? (
            <img
              src={
                typeof blogData.image === "string"
                  ? blogData.image
                  : URL.createObjectURL(blogData.image)
              }
              alt=""
              className="aspect-video w-full object-cover rounded-lg border border-gray-200 shadow-sm group-hover:brightness-90 transition"
            />
          ) : (
            <div className="aspect-video w-full flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400 text-sm bg-gray-50 hover:bg-gray-100 transition">
              Click to upload image
            </div>
          )}
        </label>
        <input
          type="file"
          accept="image/*"
          id="image"
          className="hidden"
          onChange={(e) =>
            setBlogData((blogData) => ({
              ...blogData,
              image: e.target.files[0],
            }))
          }
        />
      </div>

      {/* Title and Tags */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div>
          <h2 className="text-[1.3rem] font-semibold mb-2">Title</h2>
          <input
            type="text"
            value={blogData.title}
            placeholder="Give your blog a headline..."
            onChange={(e) =>
              setBlogData((blogData) => ({
                ...blogData,
                title: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-500"
          />
        </div>

        <div>
          <h2 className="text-[1.3rem] font-semibold mb-2">Tags</h2>
          <input
            type="text"
            placeholder="Press Enter to add tag"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-black"
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {blogData.tags?.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-sm rounded-full border border-gray-300 hover:bg-black hover:text-white transition"
              >
                {tag}
                <i
                  className="fi fi-sr-cross-circle text-base cursor-pointer"
                  onClick={() => deleteTag(index)}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Description */}
    <div className="mt-10">
      <h2 className="text-[1.3rem] font-semibold mb-2">Short Description</h2>
      <textarea
        value={blogData.description}
        placeholder="Brief summary of the article..."
        onChange={(e) =>
          setBlogData((blogData) => ({
            ...blogData,
            description: e.target.value,
          }))
        }
        className="w-full h-28 px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-black resize-none placeholder:text-gray-500"
      />
    </div>

    {/* Draft Toggle */}
    <div className="mt-8">
      <h2 className="text-[1.3rem] font-semibold mb-2">Save as Draft</h2>
      <select
        value={blogData.draft}
        onChange={(e) =>
          setBlogData((prev) => ({
            ...prev,
            draft: e.target.value === "true",
          }))
        }
        className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-black"
      >
        <option value="true">True</option> 
        <option value="false">false</option>
      </select>
    </div>

    {/* Editor */}
    <div className="mt-8">
      <h2 className="text-[1.3rem] font-semibold mb-2">Content</h2>
      <div
        id="editorjs"
        className="min-h-[300px] px-5 py-4 border border-gray-300 rounded-md bg-white"
      ></div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-4 mt-10">
      <button
        onClick={id ? handleUpdateBlog : handlePostBlog}
        className="bg-black text-white cursor-pointer font-semibold px-7 py-3 rounded-full hover:bg-gray-800 transition"
      >
        {blogData.draft
          ? "Save as Draft"
          : id
          ? "Update Blog"
          : "Publish Blog"}
      </button>
      <button
        onClick={() => navigate(-1)}
        className="px-7 py-3 rounded-full border cursor-pointer border-gray-300 text-gray-800 hover:bg-gray-100 transition"
      >
        Back
      </button>
    </div>
  </div>
);


};

export default AddBlog;
