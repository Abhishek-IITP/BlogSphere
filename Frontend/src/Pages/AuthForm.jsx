import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../Components/InputField";
import { useDispatch } from "react-redux";
import { login } from "../Utils/UserSlice";
import googleIcon from "../assets/google-icon-logo-svgrepo-com.svg";
import { googleAuth, handleRedirectResult } from "../Utils/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

const AuthForm = ({ type }) => {
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (field) => (e) =>
    setUserData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAuthForm = async (e) => {
    e.preventDefault();
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/${type}`;
      const { data } = await axios.post(url, userData);
      if (type === "signup") {
        toast.success(data.message);
        navigate("/signin");
      } else {
        toast.success(data.message);
        dispatch(login(data.user));
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setUserData({ name: "", email: "", password: "" });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const user = await googleAuth();
      if (user) {
        const idToken = await user.getIdToken();
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`, { accessToken: idToken });
        dispatch(login(res.data.user));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed");
    }
  };

  const clearOnClick = () => {
    setUserData({ name: "", email: "", password: "" });
    setShowLegacyForm(false);
  };

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const userData = await handleRedirectResult();
        if (userData) {
          const idToken = await userData.getIdToken();
          const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`, { accessToken: idToken });
          dispatch(login(res.data.user));
          toast.success(res.data.message);
          navigate("/");
        }
      } catch (error) {
        toast.error("Authentication failed: " + error.message);
      }
    };
    handleRedirect();
  }, [dispatch, navigate]);

  return (
    <div className="w-full min-h-screen bg-[#faf7f2] flex items-center justify-center p-4 md:p-8" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Main Split Layout Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-5xl bg-white border border-[#e5dfd3] rounded-[32px] p-2.5 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-[0_12px_48px_rgba(100,80,50,0.06)]"
      >

        {/* Left Side: Form, Headings, and Social Proof (col-span-7) */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-between min-h-[550px] md:min-h-[620px]">

          {/* Top: Logo & metadata tags */}
          <div>
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-8 h-8 rounded-full bg-[#c84b31] flex items-center justify-center text-white">
                <Feather size={14} />
              </div>
              <span className="text-[17px] font-bold font-serif text-[#1e1b18]">BlogSphere</span>
              <div className="h-4 w-px bg-[#e5dfd3] mx-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a08060] bg-[#faf7f2] border border-[#e5dfd3] px-2 py-0.5 rounded">
                Open Access
              </span>
            </div>

            {/* Middle: Dynamic Title, Paragraph & Actions */}
            <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight text-[#1e1b18] font-serif leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              {type === "signup" ? (
                <>Write on <span className="italic text-[#c84b31] font-normal">insight</span>,<br />not algorithms.</>
              ) : (
                <>Welcome back to the<br />sphere of <span className="italic text-[#c84b31] font-normal">ideas</span>.</>
              )}
            </h1>

            <p className="text-[14.5px] text-[#6b6259] font-light leading-relaxed mb-8 max-w-md">
              {type === "signup" ? (
                "A modern, distraction-free publishing space. Your stories stay clean, beautiful, and fully yours — protecting your focus in a purely skill-based arena."
              ) : (
                "Your drafts, followers, and published stories are waiting. Log in with Google to continue writing on your personal editorial dashboard."
              )}
            </p>

            {/* Actions: Google button / Legacy inputs */}
            <div className="max-w-md">
              {!showLegacyForm ? (
                <>
                  <motion.button
                    onClick={handleGoogleAuth}
                    whileHover={{ scale: 1.01, y: -1, boxShadow: "0 6px 18px rgba(100,80,50,0.06)" }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-3.5 bg-white border border-[#e5dfd3] hover:border-[#b8a080] text-[#1e1b18]
                               font-bold py-3.5 px-6 rounded-full text-[14px] cursor-pointer transition shadow-sm"
                  >
                    <img src={googleIcon} alt="" className="w-5 h-5" />
                    Continue with Google
                  </motion.button>

                  {type === "signin" && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowLegacyForm(true)}
                        className="text-[12px] font-bold text-[#8a7e70] hover:text-[#c84b31] transition cursor-pointer"
                      >
                        Or sign in with email and password
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3.5"
                >
                  <form onSubmit={handleAuthForm} className="flex flex-col gap-3.5">
                    <InputField
                      type="email" placeholder="Email Address"
                      value={userData.email} onChange={handleChange("email")} icon="fi-rr-envelope"
                    />
                    <InputField
                      type="password" placeholder="Password"
                      value={userData.password} onChange={handleChange("password")} icon="fi-rr-lock"
                    />
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-[#1e1b18] hover:bg-[#c84b31] text-white font-bold text-[14px] cursor-pointer transition duration-200"
                    >
                      Sign In
                    </button>
                  </form>
                  <button
                    onClick={() => setShowLegacyForm(false)}
                    className="text-[12px] font-bold text-[#8a7e70] hover:text-[#c84b31] transition text-center"
                  >
                    ← Back to Google Sign In
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Social Proof (avatars, stars, user count) */}
          <div className="mt-10 pt-6 border-t border-[#faf6f0]">
            <div className="flex flex-wrap items-center gap-4">
              {/* Stacked Avatars */}
              <div className="flex -space-x-2.5">
                {["Alex", "Jin", "Maria", "Sam", "Priya"].map((seed) => (
                  <img
                    key={seed}
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=c84b31,d4a956`}
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    alt=""
                  />
                ))}
              </div>

              {/* Stars & Text */}
              <div>
                <div className="flex gap-0.5 text-amber-500 text-[13px] leading-none mb-1">
                  {"★★★★★".split("").map((star, idx) => (
                    <span key={idx}>{star}</span>
                  ))}
                </div>
                <p className="text-[12.5px] font-semibold text-[#8a7e70] leading-none">
                  Join <span className="text-[#1e1b18] font-bold">48 writers</span> sharing insights.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Links */}
          <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#8a7e70]">
            <div className="flex gap-4">
              <span className="font-light">© 2026 BlogSphere.</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>

            <div className="font-semibold text-[#c84b31]">
              {type === "signin" ? (
                <Link to="/signup" onClick={clearOnClick} className="hover:underline">Create a new account free →</Link>
              ) : (
                <Link to="/signin" onClick={clearOnClick} className="hover:underline">Already have an account? Sign in →</Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Glowing Editorial Graphic Card (col-span-5) */}
        <div className="md:col-span-5 hidden md:block relative bg-gradient-to-br from-[#c84b31] via-[#852f1e] to-[#1e1b18] rounded-[24px] overflow-hidden p-8 flex flex-col justify-between shadow-2xl border border-[#faf7f2]/10">

          {/* Custom cosmic starry lines */}
          <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
            <svg className="w-full h-full" viewBox="0 0 350 600" fill="none">
              <circle cx="80" cy="90" r="1.5" fill="white" />
              <circle cx="280" cy="150" r="1.5" fill="white" />
              <circle cx="120" cy="480" r="1.5" fill="white" />
              {/* Organic looping background line */}
              <path d="M -50,150 Q 180,60 220,300 T 400,480" stroke="#faf7f2" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M 320,120 C 180,240 200,400 120,540" stroke="#c84b31" strokeWidth="1" opacity="0.2" />
            </svg>
          </div>

          {/* Top metadata tag */}
          <div className="relative z-10 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd0b0] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              BlogSphere // Editorial
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">
              v1.0.4
            </span>
          </div>

          {/* Central Artwork with Floating Badges (Pinterest/Cyphers inspired) */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[230px]">

              {/* Main Floating Gallery Frame with continuous loop animation */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-72 bg-white/10 border border-white/15 backdrop-blur-sm rounded-3xl overflow-hidden p-3.5 shadow-2xl"
              >
                <div className="w-full h-full overflow-hidden rounded-[16px] bg-[#faf7f2] relative" style={{ clipPath: "url(#arch-mask)" }}>
                  <img
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80"
                    alt="Aesthetic Editorial Art"
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#c84b31]/10 via-transparent to-transparent" />
                </div>
              </motion.div>

              {/* Floating Badge 1 - Top Right (Rotating Star Badge) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -top-5 -right-5 w-12 h-12 bg-[#faf7f2] border border-[#e5dfd3] rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="text-[#c84b31]" size={16} />
              </motion.div>

              {/* Floating Badge 2 - Bottom Left (Cursive Tag) */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-6 -left-8 bg-white border border-[#e5dfd3] px-4 py-2 rounded-xl shadow-lg whitespace-nowrap"
              >
                <span className="text-[12px] font-serif italic text-[#c84b31]">Aesthetic.</span>
              </motion.div>

              {/* Floating Badge 3 - Bottom Right (Dark Capsule) */}
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -right-8 bg-[#1e1b18] text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-lg whitespace-nowrap"
              >
                ✦ Curated Feed
              </motion.div>

            </div>
          </div>

          {/* Bottom taglines */}
          <div className="relative z-10 text-left border-t border-white/10 pt-4">
            <p className="text-[13.5px] text-white font-bold leading-snug font-serif mb-1.5">
              "Words carry weight, style gives them wings."
            </p>
            <p className="text-[11.5px] text-[#ffd0b0]/70 font-light font-mono">
              Join 48 creators building audiences.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default AuthForm;
