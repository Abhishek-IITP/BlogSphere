import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../Utils/UserSlice";
import useLoader from "../Hooks/useLoader";
import { 
  ArrowLeft, 
  Camera, 
  Trash2, 
  User, 
  Link as LinkIcon, 
  Globe, 
  Twitter, 
  Instagram, 
  Github, 
  Youtube 
} from "lucide-react";

function EditProfile() {
  const userState = useSelector((state) => state.user || {});
  const {
    token,
    id: userId,
    email,
    name,
    username,
    profilePicture,
    bio,
    socialLinks,
  } = userState;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, startLoading, stopLoading] = useLoader();

  const [userData, setUserData] = useState({
    profilePicture,
    username,
    name,
    bio: bio || "",
    twitter: socialLinks?.twitter || "",
    instagram: socialLinks?.instagram || "",
    github: socialLinks?.github || "",
    website: socialLinks?.website || "",
    youtube: socialLinks?.youtube || "",
  });

  const [initialData] = useState({
    profilePicture,
    username,
    name,
    bio: bio || "",
    twitter: socialLinks?.twitter || "",
    instagram: socialLinks?.instagram || "",
    github: socialLinks?.github || "",
    website: socialLinks?.website || "",
    youtube: socialLinks?.youtube || "",
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  function handleChange(e) {
    const { value, name, files } = e.target;
    if (files) {
      setUserData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setUserData((prevData) => ({ ...prevData, [name]: value }));
    }
  }

  async function handleUpdateProfile() {
    startLoading();
    setIsButtonDisabled(true);
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("username", userData.username);
    formData.append("bio", userData.bio);
    formData.append("twitter", userData.twitter);
    formData.append("instagram", userData.instagram);
    formData.append("github", userData.github);
    formData.append("website", userData.website);
    formData.append("youtube", userData.youtube);
    
    // Send either actual file object or empty profilePicture if removed
    if (userData.profilePicture instanceof File) {
      formData.append("profilePicture", userData.profilePicture);
    } else if (userData.profilePicture === null) {
      formData.append("profilePicture", "");
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      // Dispatch updated user data back into userSlice Redux state
      dispatch(login({ 
        ...userState,
        ...res.data.user, 
        token, 
        email, 
        id: userId 
      }));
      navigate(`/@${res.data.user.username}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      setIsButtonDisabled(false);
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    if (initialData) {
      const isEqual = JSON.stringify(userData) === JSON.stringify(initialData);
      setIsButtonDisabled(isEqual);
    }
  }, [userData, initialData]);

  return token == null ? (
    <Navigate to={"/signin"} />
  ) : (
    <div 
      className="w-full bg-[#faf7f2] min-h-screen text-[#1e1b18] pb-24"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="max-w-[700px] mx-auto px-6 pt-10">
        
        {/* Navigation Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-bold text-[#8a7e70] hover:text-[#c84b31] transition mb-8 cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-[#e5dfd3]/60 p-6 md:p-10 shadow-[0_2px_16px_rgba(100,80,50,0.03)]">
          <div className="border-b border-[#e5dfd3]/60 pb-5 mb-8">
            <h1 className="text-[26px] font-serif font-black text-[#1e1b18]">
              Edit Profile
            </h1>
            <p className="text-[13px] text-[#8a7e70] mt-1.5">
              Update your personal identity, bio description, and social media handles.
            </p>
          </div>

          <div className="space-y-8">
            
            {/* PHOTO UPLOADER */}
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7e70] mb-4">
                Profile Image
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Photo Preview Container */}
                <div className="relative group w-[110px] h-[110px] rounded-full overflow-hidden border-2 border-[#e5dfd3] shadow-sm">
                  {userData?.profilePicture ? (
                    <img
                      src={
                        typeof userData?.profilePicture === "string"
                          ? userData?.profilePicture
                          : URL.createObjectURL(userData?.profilePicture)
                      }
                      alt="Avatar preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f5efe5] flex items-center justify-center text-[#8a7e70]">
                      <User size={30} />
                    </div>
                  )}
                  {/* Photo Edit Overlay */}
                  <label 
                    htmlFor="profilePictureInput" 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity duration-200"
                  >
                    <Camera size={18} />
                  </label>
                </div>

                <div className="flex flex-col items-center sm:items-start gap-2">
                  <input
                    id="profilePictureInput"
                    type="file"
                    name="profilePicture"
                    accept=".png, .jpeg, .jpg"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="profilePictureInput"
                    className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[12px] font-bold px-4 py-2 rounded-full cursor-pointer transition shadow-sm"
                  >
                    Upload New Photo
                  </label>
                  {userData?.profilePicture && (
                    <button
                      onClick={() => setUserData((prev) => ({ ...prev, profilePicture: null }))}
                      className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 font-bold transition mt-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove Picture
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* IDENTITY INFO */}
            <div className="space-y-5">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7e70] border-b border-[#e5dfd3]/40 pb-2">
                Identity
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-bold text-[#5a4e40]">Display Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={userData.name}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13.5px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-bold text-[#5a4e40]">Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={userData.username}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13.5px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-bold text-[#5a4e40]">Short Biography</label>
                <textarea
                  name="bio"
                  placeholder="Describe yourself in a few words..."
                  value={userData.bio}
                  onChange={handleChange}
                  className="w-full h-24 bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-3 text-[13.5px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] resize-none transition"
                />
              </div>
            </div>

            {/* SOCIAL CONNECTIONS */}
            <div className="space-y-5">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7e70] border-b border-[#e5dfd3]/40 pb-2">
                Social Networks
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Website */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Globe size={13} className="text-[#8a7e70]" /> Personal Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    placeholder="https://example.com"
                    value={userData.website}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>

                {/* GitHub */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Github size={13} className="text-[#8a7e70]" /> GitHub Profile
                  </label>
                  <input
                    type="text"
                    name="github"
                    placeholder="github-username"
                    value={userData.github}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>

                {/* Twitter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Twitter size={13} className="text-[#8a7e70]" /> Twitter / X
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    placeholder="twitter-handle"
                    value={userData.twitter}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>

                {/* Instagram */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Instagram size={13} className="text-[#8a7e70]" /> Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="instagram-handle"
                    value={userData.instagram}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>

                {/* YouTube */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[12px] font-bold text-[#5a4e40] flex items-center gap-1.5">
                    <Youtube size={13} className="text-[#8a7e70]" /> YouTube Channel
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    placeholder="youtube-channel-handle"
                    value={userData.youtube}
                    onChange={handleChange}
                    className="w-full bg-[#fcfbfa] border border-[#e5dfd3] rounded-xl px-4 py-2.5 text-[13px] text-[#1e1b18] focus:outline-none focus:border-[#c84b31] transition"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON CONTROLS */}
            <div className="flex gap-3.5 pt-6 border-t border-[#e5dfd3]/60 justify-end">
              <button
                onClick={() => navigate(-1)}
                className="bg-transparent hover:bg-[#faf7f2] border border-[#e5dfd3] text-[#5a4e40] text-[13px] font-bold px-6 py-2.5 rounded-full transition cursor-pointer"
              >
                Cancel
              </button>
              
              {!isLoading ? (
                <button
                  disabled={isButtonDisabled}
                  onClick={handleUpdateProfile}
                  className={`text-[13px] font-bold px-7 py-2.5 rounded-full transition shadow-sm ${
                    isButtonDisabled 
                      ? "bg-[#e5dfd3] text-[#a09890] cursor-not-allowed" 
                      : "bg-[#1e1b18] hover:bg-[#c84b31] text-white cursor-pointer"
                  }`}
                >
                  Save Changes
                </button>
              ) : (
                <div className="flex items-center justify-center px-8 py-2">
                  <span className="w-5 h-5 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;