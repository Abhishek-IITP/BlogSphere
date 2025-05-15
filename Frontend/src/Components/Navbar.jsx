import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../Utils/UserSlice';

const Navbar = () => {
  const { token, name, profilePicture, username } = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItemClass =
    'text-sm md:text-base px-4 py-2 hover:bg-green-500 hover:text-white transition-colors duration-200 cursor-pointer';

  function handleLogout() {
    dispatch(logout());
    setShowPopup(false);
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    if (window.location.pathname !== '/search') {
      setSearchQuery(null);
    }
    return () => {
      if (window.location.pathname !== '/') {
        setShowPopup(false);
        setIsMobileMenuOpen(false);
      }
    };
  }, [window.location.pathname]);

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-[70px] px-4 md:px-8 relative">
          {/* Left: Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-800 font-serif hover:text-green-500 transition">
                BlogSphere
              </h1>
            </Link>

            {/* Search Bar */}
            <div
              className={`relative transition-all duration-200 ${
                showSearchBar ? 'block max-sm:absolute max-sm:top-16 max-sm:left-4 max-sm:right-4 max-sm:z-40' : 'hidden sm:block'
              }`}
            >
              <i className="fi fi-rs-search absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Search"
                className="bg-gray-100 text-sm pl-10 pr-4 py-2 rounded-full w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setShowSearchBar(false);
                    navigate(`/search?q=${searchQuery.trim()}`);
                    setSearchQuery('');
                  }
                }}
              />
            </div>
          </div>

          {/* Right: Desktop Nav */}
          <div className="hidden sm:flex items-center gap-5">
            <i
              className="fi fi-rr-search text-xl cursor-pointer sm:hidden"
              onClick={() => setShowSearchBar((prev) => !prev)}
            ></i>

            <Link to="/add-blog">
              <div className="flex items-center mt-1 gap-2 hover:text-green-500 transition">
                <i className="fi fi-rr-edit text-lg mt-1"></i>
                <span className="text-sm font-medium hidden sm:inline">Write</span>
              </div>
            </Link>

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
              <>
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
              </>
            )}
          </div>

          {/* Hamburger Icon (Mobile Only) */}
          <div className="sm:hidden flex items-center gap-4">
            <i
              className="fi fi-rr-search text-xl cursor-pointer"
              onClick={() => setShowSearchBar((prev) => !prev)}
            ></i>
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-2xl focus:outline-none"
            >
              <i className={`fi ${isMobileMenuOpen ? 'fi-rr-cross' : 'fi-rr-menu-burger'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden flex flex-col items-start bg-white border-t border-gray-200 shadow-md px-6 py-4 space-y-4">
            {token ? (
              <>
                <Link to="/add-blog" onClick={() => setIsMobileMenuOpen(false)} className={menuItemClass}>
                  ✍️ Write
                </Link>
                <Link to={`/@${username}`} onClick={() => setIsMobileMenuOpen(false)} className={menuItemClass}>
                  👤 Profile
                </Link>
                <Link to="/edit-profile" onClick={() => setIsMobileMenuOpen(false)} className={menuItemClass}>
                  🛠️ Edit Profile
                </Link>
                <Link to="/setting" onClick={() => setIsMobileMenuOpen(false)} className={menuItemClass}>
                  ⚙️ Settings
                </Link>
                <button onClick={handleLogout} className={`${menuItemClass} text-red-500`}>
                  🚪 Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className={menuItemClass}>
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className={menuItemClass}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}

        {/* Profile Dropdown (Desktop only) */}
        {showPopup && (
          <div
            onMouseLeave={() => setShowPopup(false)}
            className="absolute top-[80px] right-8 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 hidden sm:block"
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
