import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../Utils/UserSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Search, Edit3, LogOut, User, Settings, Menu, X } from 'lucide-react';
import Footer from './Footer';

const Navbar = () => {
  const { token, name, profilePicture, username } = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    dispatch(logout());
    setShowPopup(false);
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      {/* ─── EDITORIAL NAVBAR ──────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#faf7f2]/92 backdrop-blur-lg border-b border-[#e5dfd3] py-3 shadow-[0_1px_12px_rgba(100,80,50,0.06)]'
            : 'bg-transparent border-b border-transparent py-4'
        }`}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="max-w-[1500px] mx-auto px-6">

          {/* ─── DESKTOP LAYOUT: 3-Column Grid ─── */}
          <div className="hidden md:grid grid-cols-3 items-center">

            {/* Left Column: Navigation Links */}
            <div className="flex items-center gap-7">
              {token ? (
                <Link to="/" className="text-[13.5px] font-semibold text-[#5a4e40] hover:text-[#c84b31] transition">
                  Feed
                </Link>
              ) : (
                <a
                  href="#publications"
                  onClick={(e) => { e.preventDefault(); document.getElementById("publications")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="text-[13.5px] font-semibold text-[#5a4e40] hover:text-[#c84b31] transition cursor-pointer font-serif italic"
                >
                  Trending
                </a>
              )}
            </div>

            {/* Center Column: Brand Logo */}
            <Link to="/" className="flex items-center justify-center gap-2.5 group">
              <div className="w-7 h-7 rounded-full bg-[#c84b31] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Feather size={13} />
              </div>
              <span className="text-[22px] font-bold tracking-tight text-[#1e1b18] font-serif">
                BlogSphere
              </span>
            </Link>

            {/* Right Column: Actions */}
            <div className="flex items-center justify-end gap-4">
              {token ? (
                <>
                  {/* Search: Always open search bar */}
                  <div className="relative flex items-center w-full max-w-[180px] lg:max-w-[210px]">
                    <Search size={14} className="absolute left-3 text-[#8a7e70] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          navigate(`/search?q=${searchQuery.trim()}`);
                          setSearchQuery('');
                        }
                      }}
                      className="w-full bg-[#f0e8dc] border border-[#e5dfd3] text-[12px] pl-8 pr-3.5 py-1.5 rounded-full outline-none text-[#1e1b18] focus:border-[#c84b31] transition"
                    />
                  </div>

                  {/* Write CTA */}
                  <Link to="/add-blog" className="flex-shrink-0">
                    <button className="bg-[#1e1b18] hover:bg-[#c84b31] text-white text-[12px] font-bold px-4 py-2 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <Edit3 size={12} /> Write
                    </button>
                  </Link>

                  {/* Profile Avatar */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowPopup(p => !p)}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#e5dfd3] hover:border-[#c84b31] hover:scale-105 transition-all cursor-pointer"
                    >
                      <img
                        src={profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${name}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {/* Profile popup */}
                    <AnimatePresence>
                      {showPopup && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          onMouseLeave={() => setShowPopup(false)}
                          className="absolute right-0 mt-3 w-52 bg-white border border-[#e5dfd3] rounded-2xl shadow-[0_8px_30px_rgba(100,80,50,0.08)] overflow-hidden z-50 p-2"
                        >
                          <Link
                            to={`/@${username}`}
                            onClick={() => setShowPopup(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#faf7f2] text-[13px] font-semibold text-[#1e1b18] transition"
                          >
                            <User size={14} className="text-[#a08060]" /> Profile
                          </Link>
                          <Link
                            to="/setting"
                            onClick={() => setShowPopup(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#faf7f2] text-[13px] font-semibold text-[#1e1b18] transition"
                          >
                            <Settings size={14} className="text-[#a08060]" /> Settings
                          </Link>
                          <div className="h-px bg-[#e5dfd3] my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#fff0ed] text-[13px] font-bold text-red-500 transition cursor-pointer text-left"
                          >
                            <LogOut size={14} /> Log out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/signin" className="text-[13px] font-bold text-[#5a4e40] hover:text-[#c84b31] px-3 py-2 transition">
                    Sign in
                  </Link>
                  <Link to="/signup">
                    <button className="bg-[#1e1b18] hover:bg-[#c84b31] text-[#faf7f2] hover:text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow transition duration-200 cursor-pointer">
                      Join free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ─── MOBILE LAYOUT: Flex ─── */}
          <div className="flex md:hidden items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-full bg-[#c84b31] flex items-center justify-center text-white">
                <Feather size={13} />
              </div>
              <span className="text-[18px] font-bold tracking-tight text-[#1e1b18] font-serif">
                BlogSphere
              </span>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(p => !p)}
              className="p-2 text-[#1e1b18] cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ─── MOBILE DROPDOWN MENU ─── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#faf7f2] border-t border-[#e5dfd3] mt-3 overflow-hidden shadow-sm"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {token ? (
                  <>
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-semibold text-[#1e1b18]">Home Feed</Link>
                    <Link to="/add-blog" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-semibold text-[#1e1b18]">Write a Story</Link>
                    <Link to={`/@${username}`} onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-semibold text-[#1e1b18]">My Profile</Link>
                    <Link to="/setting" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-semibold text-[#1e1b18]">Settings</Link>
                    {/* Mobile search */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Search stories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            navigate(`/search?q=${searchQuery.trim()}`);
                            setSearchQuery('');
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        className="flex-1 bg-[#f0e8dc] border border-[#e5dfd3] text-[13px] px-4 py-2.5 rounded-full outline-none text-[#1e1b18] focus:border-[#c84b31] transition"
                      />
                    </div>
                    <button onClick={handleLogout} className="text-left text-[15px] font-bold text-red-500 cursor-pointer mt-2">Log Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-semibold text-[#1e1b18]">Sign In</Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-[#1e1b18] text-white font-bold py-3.5 rounded-full text-[14px]">
                        Join BlogSphere — Free
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer below fixed navbar */}
      <div className="pt-[68px]">
        <Outlet />
      </div>

      {/* Conditionally render Footer */}
      {!isAuthPage && <Footer />}
    </>
  );
};

export default Navbar;
