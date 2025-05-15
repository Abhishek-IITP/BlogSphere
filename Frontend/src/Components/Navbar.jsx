import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../Utils/UserSlice';

const Navbar = () => {
  const { token, name, profilePicture ,username } = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showSearchBar, setShowSearchBar] = useState(false);
  const menuItemClass =
    'text-sm md:text-base px-4 py-2 hover:bg-green-500 hover:text-white transition-colors duration-200 cursor-pointer';

  function handleLogout() {
    dispatch(logout());
    setShowPopup(false);
  }
  useEffect(() => {
    if (window.location.pathname !== "/search") {
      setSearchQuery(null);
    }
    return () => {
      if (window.location.pathname !== "/") {
        setShowPopup(false);
      }
    };
  }, [window.location.pathname]);

  return (
  <>
  <div className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-50">
    <div className="max-w-7xl mx-auto flex justify-between items-center h-[70px] px-4 md:px-8 relative">
      
      {/* Left section */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link to="/">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-800 font-serif hover:text-green-500 transition">
            BlogSphere
          </h1>
        </Link>

        {/* Search Bar (Desktop & Mobile) */}
        <div
          className={`relative transition-all duration-200 ${
            showSearchBar ? "block max-sm:absolute max-sm:top-16 max-sm:left-4 max-sm:right-4 max-sm:z-40" : "hidden sm:block"
          }`}
        >
          <i className="fi fi-rs-search absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-100 text-sm pl-10 pr-4 py-2 rounded-full w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.key === "Enter") {
                if (searchQuery.trim()) {
                  setShowSearchBar(false);
                  if (showSearchBar) setSearchQuery("");
                  navigate(`/search?q=${searchQuery.trim()}`);
                }
              }
            }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-10 sm:gap-5">
        {/* Search Icon (Mobile) */}
        <i
          className="fi fi-rr-search text-xl sm:hidden cursor-pointer"
          onClick={() => setShowSearchBar((prev) => !prev)}
        ></i>

        <Link to="/add-blog">
          <div className="flex items-center mt-1 gap-2 hover:text-green-500 transition">
            <i className="fi fi-rr-edit text-lg mt-1"></i>
            <span className="text-sm font-medium hidden sm:inline">Write</span>
          </div>
        </Link>

        {/* Auth/Profile */}
        {token ? (
          <div
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setShowPopup((prev) => !prev)}
          >
            <img
              src={
                profilePicture
                  ? profilePicture
                  : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`
              }
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3">
            <Link to="/signin">
              <button className="bg-green-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-green-600 transition">
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="border border-gray-300 px-4 py-1.5 rounded-full text-sm hover:bg-gray-100 transition">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>

    {/* Dropdown menu */}
    {showPopup && (
      <div
        onMouseLeave={() => setShowPopup(false)}
        className="absolute top-[80px] right-8 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
      >
        <Link to={`/@${username}`}>
          <p className={`${menuItemClass} bg-gray-50 rounded-t-xl`}>Profile</p>
        </Link>
        <Link to="/edit-profile">
          <p className={menuItemClass}>Edit Profile</p>
        </Link>
        <Link to="/setting">
          <p className={menuItemClass}>Setting</p>
        </Link>
        <p
          onClick={handleLogout}
          className={`${menuItemClass} text-red-500 rounded-b-xl`}
        >
          Log Out
        </p>
      </div>
    )}
  </div>

  {/* Space below navbar */}
  <div className="pt-[80px]">
    <Outlet />
  </div>
</>

  );
};

export default Navbar;
