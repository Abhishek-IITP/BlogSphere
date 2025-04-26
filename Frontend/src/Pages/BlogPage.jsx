import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom'

const BlogPage = () => {
    const{id} = useParams();
    const [blogData, setBlogData]=useState(null)
    
    async function fetchBlogsById() {
    try {
        let res= await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)
        setBlogData(res.data.blog)            
    
        
    } catch (error) {
        toast.error(error.message)       
    }
}
    useEffect(()=>{
        fetchBlogsById();
    },[])
    // console.log(blogData)
  return (
    <div>
        {
            blogData? <div className='max-w-[1000px]'>
                <h1 className='mt-10 font-bold text-6xl'>{blogData.title}</h1>
                <h2 className='my-5 text-3xl font-semibold'>{blogData.creator.name}</h2>
                <img src={blogData.image} alt="" />

                <button className='bg-green-400 mt-5 px-6 py-2 text-xl rounded'>
                    
                    <Link to={"/edit/" + blogData.blogId}>Edit</Link>
                        </button>
            </div> : <h1>Loading.....</h1>
        }
    </div>
  )
}

export default BlogPage