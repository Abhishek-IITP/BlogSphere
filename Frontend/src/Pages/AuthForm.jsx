import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../Components/InputField";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Utils/UserSlice";
import googleIcon from "../assets/google-icon-logo-svgrepo-com.svg"
import { googleAuth, handleRedirectResult } from "../Utils/firebase";


const AuthForm = ({ type }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const {token} = useSelector(state => state.user);
  // useEffect(()=>{
  //   if(token){
  //     navigate("/")
  //   }
  // },[token])

  const handleChange = (field) => (e) =>
    setUserData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAuthForm = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/${type}`,
        userData
      );

      if (type === "signup") {
        toast.success(data.message);
        navigate("/signin");
      } else {
        toast.success(data.message);
        dispatch(login(data.user));
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setUserData({
        name: "",
        email: "",
        password: "",
      });
    }
  };


  async function handleGoogleAuth() {
    
    try {
      let data = await googleAuth();
      const idToken = await data.getIdToken();
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`/google-auth, {
        accessToken : idToken,
      }
    )
    dispatch(login(res.data.user));
    toast.success(res.data.message);
    navigate("/")
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }

  async function clearOnClick() {
    setUserData({
      name: "",
      email: "",
      password: "",
    });
  }

  useEffect(() => {
    // Import the handleRedirectResult from your firebase utils
    const handleRedirect = async () => {
      try {
        const userData = await handleRedirectResult();
        if (userData) {
          const idToken = await userData.getIdToken();
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}`/google-auth,
            {
              accessToken: idToken,
            }
          );
          dispatch(login(res.data.user));
          toast.success(res.data.message);
          navigate("/");
        }
      } catch (error) {
        toast.error("Authentication failed");
      }
    };

    handleRedirect();
  }, [dispatch, navigate]);


  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F4ED] font-[Segoe UI]">
      <div className="w-full max-w-[420px] p-8 rounded-3xl backdrop-blur-md bg-white/60 border border-white/40 shadow-2xl">
        <h1 className="text-3xl font-bold capitalize text-center text-gray-800 mb-6">
          {type === "signup" ? "Create an account" : "Welcome back"}
        </h1>

        <form
          onSubmit={handleAuthForm}
          className="w-full flex flex-col gap-6"
        >
          {type === "signup" && (
            <InputField
              type="text"
              placeholder="Enter your Name"
              value={userData.name}
              onChange={handleChange("name")}
              icon={"fi-sr-user"}
            />
          )}
          <InputField
            type="email"
            placeholder="Enter your Email"
            value={userData.email}
            onChange={handleChange("email")}
            icon={"fi-rr-envelope"}
          />
          <InputField
            type="password"
            placeholder="Enter your Password"
            value={userData.password}
            onChange={handleChange("password")}
            icon={"fi-rr-lock"}
          />

          <button
            type="submit"
            className="w-full py-3 text-white bg-green-600 rounded-full text-lg hover:bg-green-700 transition-all duration-200"
          >
            {type === "signup" ? "Register" : "Login"}
          </button>
        </form>

        <p className=" text-xl flex justify-center my-4 font-semibold w-full">or</p>

        <div onClick={handleGoogleAuth} className="bg-white px-5 py-3 rounded-full w-full overflow-hidden flex gap-4  items-center hover:bg-green-100 justify-center cursor-pointer ">
          <p className="mt-[1px] text-2xl font-medium">Continue With</p>
          <div>
<img className="w-7 h-7 mt-1" src={googleIcon} alt="" />
          </div>


        </div>

        <p className="text-center text-sm mt-6">
          {type === "signin" ? (
            <span onClick={clearOnClick}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 underline">
                Sign Up
              </Link>
            </span>
          ) : (
            <span onClick={clearOnClick}>
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-600 underline">
                Sign In
              </Link>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;