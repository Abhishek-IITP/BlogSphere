import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DisplayBlogs from "../Components/DisplayBlogs";
import { handleFollowCreator } from "./BlogPage";

function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const { token, id: userId, following = [] } = useSelector((state) => state.user || {});
  const location = useLocation();
  const dispatch = useDispatch();

  function renderComponent() {
    if (location.pathname === `/${username}`) {
      return <DisplayBlogs blogs={userData.blogs.filter((blog) => !blog.draft)} />;
    } else if (location.pathname === `/${username}/saved-blogs`) {
      return (
        <>
          {userData.showSavedBlogs || userData._id === userId ? (
            <DisplayBlogs blogs={userData.saveBlogs} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/draft-blogs`) {
      return (
        <>
          {userId && userData._id === userId ? (
            <DisplayBlogs blogs={userData.blogs.filter((blog) => blog.draft)} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/liked-blogs`) {
      return (
        <>
          {userData.showLikedBlogs || userData._id === userId ? (
            <DisplayBlogs blogs={userData.likeBlogs} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else {
      return null;
    }
  }

  useEffect(() => {
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
    fetchUserDetails();
  }, [username]);

  return (
    <div className="w-full min-h-screen bg-white flex justify-center py-10 font-sans">
      {userData ? (
        <div className="w-[80%] flex max-lg:flex-col-reverse justify-between space-x-8 animate-fade-in">
          {/* Left Section */}
          <div className="max-lg:w-full w-[60%] space-y-8">
            <div className="hidden sm:flex justify-between items-center">
              <p className="text-4xl font-bold text-gray-800 font-display animate-slide-in">
                {userData.name}
              </p>
              <i className="fi fi-bs-menu-dots cursor-pointer text-gray-600"></i>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-x-10 border-b pb-4">
              <ul className="flex gap-8">
                <li>
                  <Link
                    to={`/${username}`}
                    className={`${
                      location.pathname === `/${username}`
                        ? "border-b-2 border-gray-800 text-gray-900"
                        : "text-gray-600"
                    } text-lg font-semibold hover:text-gray-900 transition duration-300 ease-in-out`}
                  >
                    Home
                  </Link>
                </li>

                {(userData.showSavedBlogs || userData._id === userId) && (
                  <li>
                    <Link
                      to={`/${username}/saved-blogs`}
                      className={`${
                        location.pathname === `/${username}/saved-blogs`
                          ? "border-b-2 border-gray-800 text-gray-900"
                          : "text-gray-600"
                      } text-lg font-semibold hover:text-gray-900 transition duration-300 ease-in-out`}
                    >
                      Saved Blogs
                    </Link>
                  </li>
                )}

                {(userData.showLikedBlogs || userData._id === userId) && (
                  <li>
                    <Link
                      to={`/${username}/liked-blogs`}
                      className={`${
                        location.pathname === `/${username}/liked-blogs`
                          ? "border-b-2 border-gray-800 text-gray-900"
                          : "text-gray-600"
                      } text-lg font-semibold hover:text-gray-900 transition duration-300 ease-in-out`}
                    >
                      Liked Blogs
                    </Link>
                  </li>
                )}

                {userData._id === userId && (
                  <li>
                    <Link
                      to={`/${username}/draft-blogs`}
                      className={`${
                        location.pathname === `/${username}/draft-blogs`
                          ? "border-b-2 border-gray-800 text-gray-900"
                          : "text-gray-600"
                      } text-lg font-semibold hover:text-gray-900 transition duration-300 ease-in-out`}
                    >
                      Drafts
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Blog List */}
            {renderComponent()}
          </div>

          {/* Right Sidebar */}
          <div className="max-lg:w-full w-[30%] lg:border-l lg:pl-8 space-y-8 animate-slide-in">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl animate-scale-in">
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
              <p className="text-xl font-display text-gray-800 font-bold animate-fade-in">
                {userData.name}
              </p>
              <p className="text-gray-600">
                {userData?.followers?.length || 0} Followers
              </p>
              <p className="text-sm text-gray-500 font-sans">{userData.bio}</p>

              {/* Action Button */}
              {userId === userData._id ? (
                <Link to="/edit-profile">
                  <button className="bg-green-600 text-white px-6 py-2 rounded-full mt-6 hover:bg-green-700 transition duration-300 animate-bounce">
                    Edit Profile
                  </button>
                </Link>
              ) : token ? (
                <button
                  onClick={() =>
                    handleFollowCreator(userData?._id, token, dispatch)
                  }
                  className="bg-green-600 text-white px-6 py-2 rounded-full mt-6 hover:bg-green-700 transition duration-300 animate-bounce"
                >
                  {!following.includes(userData?._id) ? "Follow" : "Following"}
                </button>
              ) : null}

              {/* Following List */}
              <div className="w-full space-y-4 mt-8 hidden lg:block">
                <h2 className="font-display font-semibold text-lg text-gray-800 animate-slide-in">
                  Following
                </h2>
                <div className="space-y-4">
                  {userData?.following?.length > 0 ? (
                    userData.following.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between animate-fade-in"
                      >
                        <Link to={`/@${user.username}`} className="flex gap-3 items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img
                              src={
                                user.profilePicture
                                  ? user.profilePicture
                                  : `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`
                              }
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-base font-medium text-gray-700 font-sans">
                            {user.name}
                          </p>
                        </Link>
                        <i className="fi fi-bs-menu-dots cursor-pointer text-gray-600"></i>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 font-sans">No following found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center items-center h-full text-xl text-gray-600 animate-pulse">
          Loading...
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
