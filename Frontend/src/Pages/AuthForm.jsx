import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import InputField from "../Components/InputField";

const AuthForm = ({ type }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const token = JSON.parse(localStorage.getItem("token"));
  if (token) return <Navigate to="/" />;

  const handleChange = (field) => (e) =>
    setUserData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAuthForm = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/${type}`,
        userData
      );
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", JSON.stringify(data.token));
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error(error);
    }
  };

  return (
    <div className="w-1/4 min-w-[300px] mt-46 flex flex-col items-center gap-5">
      <h1 className="text-3xl capitalize">{type}</h1>

      <form onSubmit={handleAuthForm} className="w-full flex flex-col gap-4">
        {type === "signup" && (
          <InputField
            type="text"
            placeholder="Enter your Name"
            value={userData.name}
            onChange={handleChange("name")}
          />
        )}
        <InputField
          type="email"
          placeholder="Enter your Email"
          value={userData.email}
          onChange={handleChange("email")}
        />
        <InputField
          type="password"
          placeholder="Enter your Password"
          value={userData.password}
          onChange={handleChange("password")}
        />

        <button
          type="submit"
          className="w-full h-11 text-white bg-gray-600 rounded-md text-lg hover:bg-gray-700 transition"
        >
          {type === "signup" ? "Register" : "Login"}
        </button>
      </form>

      <p className="text-center text-sm">
        {type === "signin" ? (
          <>
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 underline">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-500 underline">
              Sign In
            </Link>
          </>
        )}
      </p>
    </div>
  );
};
export default AuthForm;
