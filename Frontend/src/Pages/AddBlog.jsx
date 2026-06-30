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
import { addSelectedBlog, removeSelectedBlog } from "../Utils/SelectedBlogSlice";
import useLoader from "../Hooks/useLoader";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Tag as TagIcon, 
  X, 
  PenTool, 
  Eye, 
  Settings2, 
  Sparkles,
  FileText,
  Save,
  Globe
} from "lucide-react";

const AddBlog = () => {
  const { id } = useParams();
  const editorjsRef = useRef(null);
  const [isLoading, startLoading, stopLoading] = useLoader();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useSelector((slice) => slice.user || {});
  const selectedBlog = useSelector((slice) => slice.SelectedBlog || {});
  const { title, description, image, content, draft, tags, blogId } = selectedBlog;

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
    tags: [],
    draft: false,
  });

  const [ready, setReady] = useState(false);
  const [initialContent, setInitialContent] = useState(null);

  // Robust initialization and API loading fallback
  useEffect(() => {
    const loadBlog = async () => {
      if (id) {
        // Check if matching blog exists in Redux/localStorage
        if (blogId === id && title) {
          setBlogData({
            title: title || "",
            description: description || "",
            image: image || null,
            content: content || "",
            draft: draft || false,
            tags: tags || [],
          });
          setInitialContent(content);
          setReady(true);
        } else {
          // Fallback fetch if refreshed or direct link
          try {
            startLoading();
            const { data } = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
            );
            const fetched = data.blog;
            dispatch(addSelectedBlog(fetched));
            setBlogData({
              title: fetched.title || "",
              description: fetched.description || "",
              image: fetched.image || null,
              content: fetched.content || "",
              draft: fetched.draft || false,
              tags: fetched.tags || [],
            });
            setInitialContent(fetched.content);
            setReady(true);
          } catch (error) {
            toast.error("Failed to load existing story for editing");
            navigate("/");
          } finally {
            stopLoading();
          }
        }
      } else {
        // Create mode
        setReady(true);
      }
    };
    loadBlog();
  }, [id, blogId, title, dispatch, navigate]);

  // Handle post submit
  async function handlePostBlog() {
    if (!blogData.title.trim()) return toast.error("Please enter a title");
    if (!blogData.description.trim()) return toast.error("Please enter a short description");
    if (!blogData.image) return toast.error("Please select a cover image");
    if (!blogData.content || !blogData.content.blocks || blogData.content.blocks.length === 0) {
      return toast.error("Please add some content to your story");
    }

    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("content", JSON.stringify(blogData.content));
    formData.append("tags", JSON.stringify(blogData.tags));
    formData.append("draft", blogData.draft);

    blogData.content.blocks.forEach((block) => {
      if (block.type === 'image' && block.data.file?.image) {
        formData.append("images", block.data.file.image);
      }
    });

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
      toast.error(error.response?.data?.message || "Failed to post blog");
    } finally {
      stopLoading();
    }
  }

  // Handle update submit
  async function handleUpdateBlog() {
    if (!blogData.title.trim()) return toast.error("Please enter a title");
    if (!blogData.description.trim()) return toast.error("Please enter a short description");
    if (!blogData.content || !blogData.content.blocks || blogData.content.blocks.length === 0) {
      return toast.error("Please add some content to your story");
    }

    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("content", JSON.stringify(blogData.content));
    formData.append("tags", JSON.stringify(blogData.tags));
    formData.append("draft", blogData.draft);

    const existingImages = [];
    blogData.content.blocks.forEach((block) => {
      if (block.type === 'image') {
        if (block.data.file?.image) {
          formData.append("images", block.data.file.image);
        } else {
          existingImages.push({
            url: block.data.file?.url,
            imageId: block.data.file?.imageId,
          });
        }
      }
    });
    formData.append("existingImages", JSON.stringify(existingImages));

    try {
      startLoading();
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
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
      toast.error(error.response?.data?.message || "Failed to update blog");
    } finally {
      stopLoading();
    }
  }

  // EditorJS Initialization
  const intilizeEditorjs = React.useCallback(() => {
    if (editorjsRef.current !== null) return;

    editorjsRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Write your masterpiece here...",
      data: initialContent || {},
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter Your Heading...",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        List: {
          class: NestedList,
          config: {},
          inlineToolbar: true,
        },
        code: CodeTool,
        Marker: Marker,
        Underline: Underline,
        embed: Embed,
        raw: RawTool,
        textVariant: TextVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (imageFile) => {
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(imageFile),
                    image: imageFile,
                  },
                };
              },
            },
          },
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
      tunes: ["textVariant"],
      onChange: async () => {
        if (!editorjsRef.current) return;
        const data = await editorjsRef.current.save();
        setBlogData((prev) => ({ ...prev, content: data }));
      },
    });
  }, [initialContent]);

  // Handle Tag Input KeyDown
  function handleKeyDown(e) {
    const tag = e.target.value.trim().toLowerCase();

    if (e.code === "Space" || e.keyCode === 32) {
      e.preventDefault();
    }

    if ((e.code === "Enter" || e.keyCode === 13) && tag !== "") {
      if (blogData.tags.length >= 10) {
        e.target.value = "";
        return toast.error("You can add up to 10 tags");
      }
      if (blogData.tags.includes(tag)) {
        e.target.value = "";
        return toast.error("This tag has already been added");
      }
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      e.target.value = "";
    }
  }

  // Delete Tag badge
  function deleteTag(index) {
    const updatedTags = blogData.tags.filter((_, tagIndex) => tagIndex !== index);
    setBlogData((prev) => ({ ...prev, tags: updatedTags }));
  }

  // Cleanup effects
  useEffect(() => {
    if (ready && editorjsRef.current === null) {
      intilizeEditorjs();
    }

    return () => {
      if (editorjsRef.current !== null && window.location.pathname !== `/edit/${id}`) {
        try {
          if (editorjsRef.current.destroy) {
            editorjsRef.current.destroy();
          }
        } catch (e) {
          console.error("EditorJS destruction error", e);
        }
        editorjsRef.current = null;
        dispatch(setIsOpen(false));
        dispatch(removeSelectedBlog());
      }
    };
  }, [ready, intilizeEditorjs, dispatch, id]);

  return token == null ? (
    <Navigate to="/signin" />
  ) : (
    <div 
      className="w-full bg-[#faf7f2] min-h-screen text-[#1e1b18] pb-24"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="max-w-[900px] mx-auto px-6 pt-10">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e5dfd3] pb-6 mb-8 gap-4">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[13px] font-bold text-[#8a7e70] hover:text-[#c84b31] transition mb-3 cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <h1 className="text-[26px] font-serif font-black text-[#1e1b18]">
              {id ? "Edit Story" : "Write a Story"}
            </h1>
            <p className="text-[13px] text-[#8a7e70] mt-1 flex items-center gap-1">
              <Sparkles size={13} className="text-[#c84b31]" /> Craft your thoughts, customize details, and share.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent hover:bg-white border border-[#e5dfd3] text-[#5a4e40] text-[13px] font-bold px-5 py-2.5 rounded-full transition cursor-pointer"
            >
              Cancel
            </button>

            {!isLoading ? (
              <button
                onClick={id ? handleUpdateBlog : handlePostBlog}
                className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {blogData.draft ? (
                  <>
                    <Save size={14} /> Save Draft
                  </>
                ) : (
                  <>
                    <Globe size={14} /> {id ? "Update Story" : "Publish Story"}
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center px-8 py-2">
                <span className="w-5 h-5 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
          </div>
        </div>

        {ready ? (
          <div className="space-y-8">
            
            {/* Visual Grid Settings */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left Column: Cover Image Upload */}
              <div className="md:col-span-6 flex flex-col">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7e70] mb-3.5 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-[#c84b31]" /> Cover Picture
                </h3>
                
                <label htmlFor="image" className="block cursor-pointer flex-1 group">
                  {blogData.image ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#e5dfd3] shadow-sm hover:border-[#c84b31]/40 transition duration-300">
                      <img
                        src={
                          typeof blogData.image === "string"
                            ? blogData.image
                            : URL.createObjectURL(blogData.image)
                        }
                        alt="Cover Preview"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-black/40 px-3 py-1.5 rounded-full">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed border-[#e5dfd3] rounded-2xl text-[#8a7e70] bg-white hover:bg-[#fdfbf7] hover:border-[#c84b31]/40 transition duration-300 p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#faf7f2] flex items-center justify-center text-[#c84b31] mb-2.5 shadow-sm">
                        <ImageIcon size={18} />
                      </div>
                      <p className="text-[13px] font-bold text-[#1e1b18]">Upload cover image</p>
                      <p className="text-[11px] text-[#8a7e70] font-light mt-1">Recommended: high contrast widescreen landscape (JPG/PNG)</p>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="image"
                  className="hidden"
                  onChange={(e) =>
                    setBlogData((prev) => ({
                      ...prev,
                      image: e.target.files[0],
                    }))
                  }
                />
              </div>

              {/* Right Column: Title & Tags */}
              <div className="md:col-span-6 flex flex-col space-y-5">
                {/* Title Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <FileText size={13} className="text-[#8a7e70]" /> Story Headline
                  </label>
                  <input
                    type="text"
                    value={blogData.title}
                    placeholder="Enter an inspiring title..."
                    onChange={(e) =>
                      setBlogData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-[#e5dfd3] rounded-xl px-4 py-3 text-[14.5px] text-[#1e1b18] placeholder:text-[#a09890] focus:outline-none focus:border-[#c84b31] transition shadow-sm font-serif font-black"
                  />
                </div>

                {/* Tags Badge Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <TagIcon size={13} className="text-[#8a7e70]" /> Tags & Topics
                  </label>
                  <input
                    type="text"
                    placeholder="Type topic and press Enter..."
                    className="w-full bg-white border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13.5px] text-[#1e1b18] placeholder:text-[#a09890] focus:outline-none focus:border-[#c84b31] transition shadow-sm"
                    onKeyDown={handleKeyDown}
                  />
                  
                  {/* Badges Container */}
                  {blogData.tags && blogData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {blogData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-[#c84b31]/8 text-[#c84b31] text-[11.5px] font-bold rounded-full border border-[#c84b31]/10 hover:border-[#c84b31]/30 transition"
                        >
                          #{tag}
                          <X
                            size={11}
                            className="cursor-pointer text-[#c84b31]/70 hover:text-[#c84b31] ml-0.5"
                            onClick={() => deleteTag(index)}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Description & Publish Settings */}
            <div className="bg-white rounded-3xl border border-[#e5dfd3]/60 p-6 md:p-8 shadow-[0_2px_12px_rgba(100,80,50,0.02)] space-y-6">
              
              {/* Short Summary */}
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                  <PenTool size={13} className="text-[#8a7e70]" /> Short Description
                </label>
                <textarea
                  value={blogData.description}
                  placeholder="Provide a brief summary of this article to entice readers in the feed..."
                  onChange={(e) =>
                    setBlogData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full h-24 bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-3 text-[13.5px] text-[#1e1b18] placeholder:text-[#a09890] focus:outline-none focus:border-[#c84b31] resize-none transition shadow-sm font-light leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Draft Toggle */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Eye size={13} className="text-[#8a7e70]" /> Publish Visibility
                  </label>
                  <select
                    value={blogData.draft}
                    onChange={(e) =>
                      setBlogData((prev) => ({
                        ...prev,
                        draft: e.target.value === "true",
                      }))
                    }
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13.5px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition shadow-sm"
                  >
                    <option value="false">Public Story (Publish Immediately)</option>
                    <option value="true">Draft Story (Save Privately)</option>
                  </select>
                </div>

                {/* Additional Placeholder Settings Row */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Settings2 size={13} className="text-[#8a7e70]" /> Editor Interface
                  </label>
                  <div className="w-full bg-[#faf7f2]/60 border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13px] text-[#8a7e70] font-light flex items-center gap-1.5 select-none">
                    <span>Active: Rich Block Editor (Editor.js)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Rich Editor Block */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7e70] flex items-center gap-1.5 pl-1">
                <FileText size={14} className="text-[#c84b31]" /> Story Body Content
              </h3>
              <div 
                id="editorjs"
                className="min-h-[450px] px-8 py-10 border border-[#e5dfd3]/60 rounded-3xl bg-white shadow-[0_2px_12px_rgba(100,80,50,0.02)] text-[16px] sm:text-[17.5px] leading-relaxed prose prose-stone max-w-none focus:outline-none"
              ></div>
            </div>

            {/* Action Buttons Bottom */}
            <div className="flex gap-4 pt-6 border-t border-[#e5dfd3] justify-end">
              <button
                onClick={() => navigate(-1)}
                className="bg-transparent hover:bg-white border border-[#e5dfd3] text-[#5a4e40] text-[13px] font-bold px-6 py-2.5 rounded-full transition cursor-pointer"
              >
                Cancel
              </button>
              
              {!isLoading ? (
                <button
                  onClick={id ? handleUpdateBlog : handlePostBlog}
                  className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[13px] font-bold px-8 py-2.5 rounded-full transition shadow-sm flex items-center gap-1.5 cursor-pointer animate-fade-in"
                >
                  {blogData.draft ? (
                    <>
                      <Save size={14} /> Save Draft
                    </>
                  ) : (
                    <>
                      <Globe size={14} /> {id ? "Update Story" : "Publish Story"}
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center px-8 py-2">
                  <span className="w-5 h-5 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col justify-center items-center w-full h-[calc(100vh-300px)] gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-[12px] text-[#8a7e70]">Loading story details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBlog;
