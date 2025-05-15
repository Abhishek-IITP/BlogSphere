import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { updateData } from "../Utils/UserSlice";

function Setting() {
  const {
    token,
    showLikedBlogs,
    showSavedBlogs,
  } = useSelector((state) => state.user);

  const [data, setData] = useState({
    showLikedBlogs,
    showSavedBlogs,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleVisibility() {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/change-saved-liked-blog-visibility`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateData(["visibility", data]));
      toast.success(res.data.message);
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  if (!token) return <Navigate to="/signin" />;

  return (
    <div className="min-h-screen bg-white px-6 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <h2 className="text-3xl font-semibold text-gray-900 mb-8">Settings</h2>

        <div className="space-y-6">
          {/* Toggle Row */}
          {[
            {
              label: "Show Saved Blogs",
              desc: "Allow others to view your saved blogs",
              value: data.showSavedBlogs,
              key: "showSavedBlogs",
            },
            {
              label: "Show Liked Blogs",
              desc: "Allow others to view your liked blogs",
              value: data.showLikedBlogs,
              key: "showLikedBlogs",
            },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 shadow-sm">
              <div>
                <p className="text-lg font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-500">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.value}
                  onChange={() =>
                    setData((prev) => ({
                      ...prev,
                      [setting.key]: !prev[setting.key],
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer dark:bg-gray-200 peer-checked:bg-green-500 transition-all"></div>
                <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-5 transition-all duration-300"></div>
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={handleVisibility}
          className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 rounded-full shadow-sm transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Setting;
