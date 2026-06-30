import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DisplayBlogs from "../Components/DisplayBlogs";
import { handleFollowCreator } from "./BlogPage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Twitter, 
  Instagram, 
  Github, 
  Youtube, 
  UserCheck, 
  UserPlus, 
  Edit3, 
  X, 
  Calendar,
  Layers,
  Heart,
  Bookmark,
  FileText
} from "lucide-react";

function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { token, id: userId, following = [] } = useSelector((state) => state.user || {});
  const location = useLocation();
  const dispatch = useDispatch();

  function renderComponent() {
    if (!userData) return null;
    
    if (location.pathname === `/${username}`) {
      const publicBlogs = userData.blogs?.filter((blog) => !blog.draft) || [];
      return <DisplayBlogs blogs={publicBlogs} />;
    } else if (location.pathname === `/${username}/saved-blogs`) {
      return (
        <>
          {userData.showSavedBlogs || userData._id === userId ? (
            <DisplayBlogs blogs={userData.saveBlogs || []} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/draft-blogs`) {
      return (
        <>
          {userId && userData._id === userId ? (
            <DisplayBlogs blogs={userData.blogs?.filter((blog) => blog.draft) || []} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/liked-blogs`) {
      return (
        <>
          {userData.showLikedBlogs || userData._id === userId ? (
            <DisplayBlogs blogs={userData.likeBlogs || []} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else {
      return null;
    }
  }

  async function fetchUserDetails() {
    try {
      let res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/${username.split("@")[1]}`
      );
      setUserData(res.data.user);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch user");
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, [username]);

  // Handle follow click inside profile
  const handleFollow = async () => {
    await handleFollowCreator(userData?._id, token, dispatch);
    // Refresh user details to get updated followers list/count
    fetchUserDetails();
  };

  const isMe = userData?._id === userId;
  const isFollowing = following.includes(userData?._id);

  return (
    <div 
      className="w-full bg-[#faf7f2] min-h-screen text-[#1e1b18] pb-24"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="max-w-[1500px] mx-auto px-6 pt-10">
        {userData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ─── LEFT COLUMN: ARTICLES & TABS (8/12 width) ─────────── */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
              
              {/* Navigation Tabs (Alder & Co. style) */}
              <div className="border-b border-[#e5dfd3] pb-1">
                <nav className="flex items-center gap-6 overflow-x-auto scrollbar-none">
                  <Link
                    to={`/${username}`}
                    className={`pb-3 text-[14px] font-bold transition-all relative ${
                      location.pathname === `/${username}`
                        ? "text-[#c84b31]"
                        : "text-[#8a7e70] hover:text-[#1e1b18]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} /> Published
                    </span>
                    {location.pathname === `/${username}` && (
                      <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c84b31]" />
                    )}
                  </Link>

                  {(userData.showSavedBlogs || isMe) && (
                    <Link
                      to={`/${username}/saved-blogs`}
                      className={`pb-3 text-[14px] font-bold transition-all relative ${
                        location.pathname === `/${username}/saved-blogs`
                          ? "text-[#c84b31]"
                          : "text-[#8a7e70] hover:text-[#1e1b18]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Bookmark size={14} /> Saved Stories
                      </span>
                      {location.pathname === `/${username}/saved-blogs` && (
                        <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c84b31]" />
                      )}
                    </Link>
                  )}

                  {(userData.showLikedBlogs || isMe) && (
                    <Link
                      to={`/${username}/liked-blogs`}
                      className={`pb-3 text-[14px] font-bold transition-all relative ${
                        location.pathname === `/${username}/liked-blogs`
                          ? "text-[#c84b31]"
                          : "text-[#8a7e70] hover:text-[#1e1b18]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Heart size={14} /> Liked
                      </span>
                      {location.pathname === `/${username}/liked-blogs` && (
                        <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c84b31]" />
                      )}
                    </Link>
                  )}

                  {isMe && (
                    <Link
                      to={`/${username}/draft-blogs`}
                      className={`pb-3 text-[14px] font-bold transition-all relative ${
                        location.pathname === `/${username}/draft-blogs`
                          ? "text-[#c84b31]"
                          : "text-[#8a7e70] hover:text-[#1e1b18]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} /> Drafts
                      </span>
                      {location.pathname === `/${username}/draft-blogs` && (
                        <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c84b31]" />
                      )}
                    </Link>
                  )}
                </nav>
              </div>

              {/* Feed Card List */}
              <div className="bg-white/40 border border-[#e5dfd3]/60 rounded-3xl p-6 shadow-[0_1px_6px_rgba(100,80,50,0.01)]">
                {renderComponent()}
              </div>

            </div>

            {/* ─── RIGHT COLUMN: USER PROFILE CARD (4/12 width) ──────── */}
            <aside className="col-span-1 lg:col-span-4 sticky top-24 h-fit space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-[#e5dfd3]/60 p-6 md:p-8 shadow-[0_2px_12px_rgba(100,80,50,0.03)] text-center flex flex-col items-center">
                
                {/* Clickable Profile Picture */}
                <div 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-[#e5dfd3] shadow-sm cursor-pointer hover:border-[#c84b31] transition-all"
                  title="Click to view details"
                >
                  <img
                    src={
                      userData.profilePicture
                        ? userData.profilePicture
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`
                    }
                    alt={userData.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-300"
                  />
                  {/* Subtle hover icon */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Expand</span>
                  </div>
                </div>

                {/* Name & username */}
                <h2 className="text-[20px] font-serif font-black text-[#1e1b18] mt-4 capitalize">
                  {userData.name}
                </h2>
                <p className="text-[12px] text-[#8a7e70] font-medium">
                  @{userData.username}
                </p>

                {/* Biography */}
                {userData.bio ? (
                  <p className="text-[13px] text-[#5a4e40] font-light leading-relaxed mt-4 max-w-[280px]">
                    {userData.bio}
                  </p>
                ) : (
                  <p className="text-[13px] text-[#a09890] italic font-light mt-4">
                    No bio description provided yet.
                  </p>
                )}

                {/* Follower Stats Row */}
                <div className="flex items-center gap-6 mt-6 pb-6 border-b border-[#e5dfd3]/60 w-full justify-center">
                  <div className="text-center">
                    <p className="text-[16px] font-bold text-[#1e1b18]">
                      {userData?.followers?.length || 0}
                    </p>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8a7e70]">
                      Followers
                    </p>
                  </div>
                  <div className="w-px h-8 bg-[#e5dfd3]/60" />
                  <div className="text-center">
                    <p className="text-[16px] font-bold text-[#1e1b18]">
                      {userData?.following?.length || 0}
                    </p>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8a7e70]">
                      Following
                    </p>
                  </div>
                </div>

                {/* Social Networks Links */}
                {userData.socialLinks && Object.values(userData.socialLinks).some(link => link) ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {userData.socialLinks.website && (
                      <a 
                        href={userData.socialLinks.website.startsWith("http") ? userData.socialLinks.website : `https://${userData.socialLinks.website}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-[#e5dfd3] flex items-center justify-center text-[#5a4e40] hover:text-[#c84b31] hover:border-[#c84b31] bg-white transition shadow-sm"
                        title="Website"
                      >
                        <Globe size={14} />
                      </a>
                    )}
                    {userData.socialLinks.github && (
                      <a 
                        href={`https://github.com/${userData.socialLinks.github}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-[#e5dfd3] flex items-center justify-center text-[#5a4e40] hover:text-[#c84b31] hover:border-[#c84b31] bg-white transition shadow-sm"
                        title="GitHub"
                      >
                        <Github size={14} />
                      </a>
                    )}
                    {userData.socialLinks.twitter && (
                      <a 
                        href={`https://twitter.com/${userData.socialLinks.twitter}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-[#e5dfd3] flex items-center justify-center text-[#5a4e40] hover:text-[#c84b31] hover:border-[#c84b31] bg-white transition shadow-sm"
                        title="Twitter / X"
                      >
                        <Twitter size={14} />
                      </a>
                    )}
                    {userData.socialLinks.instagram && (
                      <a 
                        href={`https://instagram.com/${userData.socialLinks.instagram}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-[#e5dfd3] flex items-center justify-center text-[#5a4e40] hover:text-[#c84b31] hover:border-[#c84b31] bg-white transition shadow-sm"
                        title="Instagram"
                      >
                        <Instagram size={14} />
                      </a>
                    )}
                    {userData.socialLinks.youtube && (
                      <a 
                        href={`https://youtube.com/@${userData.socialLinks.youtube}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-[#e5dfd3] flex items-center justify-center text-[#5a4e40] hover:text-[#c84b31] hover:border-[#c84b31] bg-white transition shadow-sm"
                        title="YouTube"
                      >
                        <Youtube size={14} />
                      </a>
                    )}
                  </div>
                ) : (
                  isMe && (
                    <Link to="/edit-profile" className="text-[11px] font-bold text-[#c84b31] hover:underline mt-6">
                      + Connect your social media handles
                    </Link>
                  )
                )}

                {/* Primary CTA Button */}
                {isMe ? (
                  <Link to="/edit-profile" className="w-full mt-6">
                    <button className="w-full bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[13px] font-bold py-2.5 px-6 rounded-full transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                      <Edit3 size={13} /> Edit Profile
                    </button>
                  </Link>
                ) : token ? (
                  <button
                    onClick={handleFollow}
                    className={`w-full mt-6 text-[13px] font-bold py-2.5 px-6 rounded-full transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                      isFollowing 
                        ? "bg-transparent border border-[#e5dfd3] text-[#5a4e40] hover:text-red-500 hover:border-red-200" 
                        : "bg-[#1e1b18] hover:bg-[#c84b31] text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={13} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} /> Follow Creator
                      </>
                    )}
                  </button>
                ) : null}

              </div>

            </aside>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center w-full h-[calc(100vh-300px)] gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#c84b31] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-[12px] text-[#8a7e70]">Loading profile...</p>
          </div>
        )}
      </div>

      {/* ─── INTERACTIVE MODAL OVERLAY (Triggers on Avatar Click) ─── */}
      <AnimatePresence>
        {isPhotoModalOpen && userData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[500px] bg-[#faf7f2] rounded-3xl border border-[#e5dfd3] shadow-2xl overflow-hidden p-6 z-10 flex flex-col items-center text-center font-['Outfit']"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-red-50 text-[#8a7e70] hover:text-red-500 border border-[#e5dfd3] flex items-center justify-center transition cursor-pointer"
              >
                <X size={15} />
              </button>

              {/* Large Profile Picture */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md mt-4">
                <img
                  src={
                    userData.profilePicture
                      ? userData.profilePicture
                      : `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`
                  }
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <h2 className="text-[22px] font-serif font-black text-[#1e1b18] mt-4 capitalize">
                {userData.name}
              </h2>
              <p className="text-[12.5px] text-[#8a7e70] font-medium">
                @{userData.username}
              </p>

              {/* Date Joined */}
              <p className="text-[11px] text-[#a09890] mt-1.5 flex items-center gap-1.5 justify-center">
                <Calendar size={11} /> Joined BlogSphere on {new Date(userData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </p>

              {/* Bio */}
              <p className="text-[13.5px] text-[#5a4e40] font-light leading-relaxed mt-5 max-w-[340px]">
                {userData.bio || "No biography details shared."}
              </p>

              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-4 border border-[#e5dfd3] rounded-2xl p-4 w-full mt-6 bg-white/50">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8a7e70]">Followers</h4>
                  <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                    {userData.followers && userData.followers.length > 0 ? (
                      userData.followers.slice(0, 5).map((follower, idx) => (
                        <Link 
                          key={idx} 
                          to={`/@${follower.username}`} 
                          onClick={() => setIsPhotoModalOpen(false)}
                          title={follower.name}
                        >
                          <img 
                            src={follower.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${follower.name}`} 
                            alt="" 
                            className="w-6 h-6 rounded-full border border-white object-cover" 
                          />
                        </Link>
                      ))
                    ) : (
                      <span className="text-[12px] text-[#a09890] font-light">0 users</span>
                    )}
                    {userData.followers?.length > 5 && (
                      <span className="text-[10px] font-bold text-[#8a7e70] bg-[#f0ebe3] w-6 h-6 rounded-full flex items-center justify-center">
                        +{userData.followers.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-l border-[#e5dfd3]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8a7e70]">Following</h4>
                  <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                    {userData.following && userData.following.length > 0 ? (
                      userData.following.slice(0, 5).map((followed, idx) => (
                        <Link 
                          key={idx} 
                          to={`/@${followed.username}`} 
                          onClick={() => setIsPhotoModalOpen(false)}
                          title={followed.name}
                        >
                          <img 
                            src={followed.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${followed.name}`} 
                            alt="" 
                            className="w-6 h-6 rounded-full border border-white object-cover" 
                          />
                        </Link>
                      ))
                    ) : (
                      <span className="text-[12px] text-[#a09890] font-light">0 users</span>
                    )}
                    {userData.following?.length > 5 && (
                      <span className="text-[10px] font-bold text-[#8a7e70] bg-[#f0ebe3] w-6 h-6 rounded-full flex items-center justify-center">
                        +{userData.following.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full mt-6 justify-center">
                {isMe ? (
                  <Link to="/edit-profile" onClick={() => setIsPhotoModalOpen(false)} className="w-full">
                    <button className="w-full bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[13px] font-bold py-2.5 rounded-full transition shadow-sm cursor-pointer">
                      Configure Profile Settings
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      handleFollow();
                    }}
                    className={`w-full text-[13px] font-bold py-2.5 rounded-full transition shadow-sm cursor-pointer ${
                      isFollowing 
                        ? "bg-transparent border border-[#e5dfd3] text-[#5a4e40] hover:text-red-500 hover:border-red-200" 
                        : "bg-[#1e1b18] hover:bg-[#c84b31] text-white"
                    }`}
                  >
                    {isFollowing ? "Unfollow User" : "Follow User"}
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfilePage;
