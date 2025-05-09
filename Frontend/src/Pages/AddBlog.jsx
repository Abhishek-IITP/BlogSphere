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

const AddBlog = () => {
  const { id } = useParams();
  const editorjsRef= useRef(null);
  
  const formData= new FormData();
  const {token}= useSelector(slice=>slice.user)
  const {title, description, image, content}= useSelector(slice => slice.SelectedBlog)
  
    const [blogData, setBlogData] = useState({
      title: "",
      description: "",
      image: null,
      tags: [],
      content: "",
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
      // console.log(res);
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
        console.log(error)
      toast.error(error.response.data.message);
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

    try {
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
  ) :(
//     <div className="w-[620px] mx-auto">

// <div className=" my-4">
// <h2 className="text-2xl font-semibold my-2">Title</h2>
// <input
//       className="bg-gray-50 border drop-shadow-xl border-gray-200 w-1/2 focus:outline-none rounded-lg p-2 placeholder:text-lg capitalize"
//       type="text"
//         placeholder="title"
//         onChange={(e) =>
//           setBlogData((blogData) => ({ ...blogData, title: e.target.value }))
//         }
//         value={blogData.title}
        
//       />
//         </div>

//       <div className="my-4">
//       <h2 className="text-2xl font-semibold my-2">Description</h2>
   
//           <textarea type="text" placeholder="description"  className='resize-none h-[150px] border 
//     border-gray-200 drop-shadow-2xl w-full p-4 text-lg focus:outline-none placeholder:text-lg capitalize'
//     // <input
//     // className="bg-amber-50 " 

//     //   type="text"
      
      
//     //   value={blogData.description}
//     // />
//     onChange={(e) =>
//       setBlogData((blogData) => ({
//         ...blogData,
//         description: e.target.value,
//       }))
//     } />
//       </div>
    

//       <div>
//       <h2 className="text-2xl font-semibold my-2">Image</h2>

//         <label htmlFor="image">
//           {blogData.image ? (
//             <img
//               src={typeof(blogData.image)=== "string"? blogData.image:URL.createObjectURL(blogData.image)}
//               alt=""
//               className="aspect-video border-gray-200 border rounded-xl object-cover"
//             />
//           ) : (
//             <div className="bg-white border-gray-400 border rounded-xl aspect-video flex justify-center items-center text-4xl opacity-40">
//               <h1>select image</h1>
//             </div>
//           )}
//         </label>
//         <input
//           className="hidden"
//           id="image"
//           type="file"
//           accept=".png , .jpeg ,jpg"
//           onChange={(e) =>
//             setBlogData((blogData) => ({
//               ...blogData,
//               image: e.target.files[0],
//             }))
//           }
//         />
//       </div>

//       <div className="my-4">
//       <h2 className="text-2xl font-semibold my-2">Content</h2>
//       <div className=" min-h-10" id="editorjs"></div>
//       </div>

//       <button className="bg-green-500 my-6  rounded-full font-semibold hover:bg-green-600 cursor-pointer transition-all text-lg py-4 px-7 text-white" onClick={id?handleUpdateBlog:handlePostBlog}>{id?"Update Blog":"Post Blog"}</button>
//     </div>
<div className=" p-5 w-full sm:w-[500px] lg:w-[1000px] mx-auto">
      <div className=" lg:flex lg:justify-between  gap-8">
        <div className=" lg:w-3/6">
          <h2 className="text-2xl font-semibold my-2">Image</h2>
          <label htmlFor="image" className=" ">
            {blogData.image ? (
              <img
                src={
                  typeof blogData.image == "string"
                    ? blogData.image
                    : URL.createObjectURL(blogData.image)
                }
                alt=""
                className="aspect-video object-cover border rounded-lg"
              />
            ) : (
              <div className=" bg-white border rounded-lg aspect-video opacity-50 flex justify-center items-center text-4xl">
                Select Image
              </div>
            )}
          </label>
          <input
            className="hidden"
            id="image"
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={(e) =>
              setBlogData((blogData) => ({
                ...blogData,
                image: e.target.files[0],
              }))
            }
          />
        </div>

        <div className=" lg:w-3/6">
          <div className="my-4">
            <h2 className="text-2xl font-semibold my-2">Title</h2>
            <input
              type="text"
              placeholder="title"
              onChange={(e) =>
                setBlogData((blogData) => ({
                  ...blogData,
                  title: e.target.value,
                }))
              }
              value={blogData.title}
              className="border focus:outline-none rounded-lg w-full p-2 placeholder:text-lg"
            />
          </div>

          <div className="my-4">
            <h2 className="text-2xl font-semibold my-2">Tags</h2>
            <input
              type="text"
              placeholder="tags"
              className="w-full p-3 rounded-lg border text-lg focus:outline-none"
              onKeyDown={handleKeyDown}
            />

            <div className="flex justify-between my-2">
              <p className="text-xs my1 opacity-60">
                *Click on Enter to add Tag
              </p>
              <p className="text-xs my1 opacity-60">
                {10 - blogData.tags.length} tags remaining
              </p>
            </div>

            <div className="flex flex-wrap">
              {blogData?.tags?.map((tag, index) => (
                <div
                  key={index}
                  className="m-2 bg-gray-200 text-black  hover:text-white hover:bg-blue-500 rounded-full px-7 py-2 flex gap-3 justify-center items-center"
                >
                  <p>{tag}</p>
                  <i
                    className="fi fi-sr-cross-circle mt-1 text-xl cursor-pointer"
                    onClick={() => deleteTag(index)}
                  ></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="my-4">
        <h2 className="text-2xl font-semibold my-2">Description</h2>
        <textarea
          type="text"
          placeholder="description"
          value={blogData.description}
          className=" h-[100px] resize-none w-full p-3 rounded-lg border text-lg focus:outline-none"
          onChange={(e) =>
            setBlogData((blogData) => ({
              ...blogData,
              description: e.target.value,
            }))
          }
        />
      </div>

      <div className="my-4">
        <h2 className="text-2xl font-semibold my-2">Draft</h2>
        <select
          value={blogData.draft}
          name=""
          id=""
          className="w-full p-3 rounded-lg border text-lg focus:outline-none"
          onChange={(e) =>
            setBlogData((prev) => ({
              ...prev,
              draft: e.target.value == "true" ? true : false,
            }))
          }
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>

      <div className="my-4">
        <h2 className="text-2xl font-semibold my-2">Content</h2>
        <div id="editorjs" className="w-full"></div>
      </div>

        <div>
          <button
            className="bg-blue-500 px-7 py-3 rounded-full  font-semibold text-white my-6 "
            onClick={id ? handleUpdateBlog : handlePostBlog}
          >
            {blogData.draft
              ? "Save as Draft"
              : id
              ? "Update blog"
              : "Post blog"}
          </button>
          <button
            className={` mx-4 px-7 py-3 rounded-full text-white my-3 bg-black`}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

    </div>

  );
};

export default AddBlog;
