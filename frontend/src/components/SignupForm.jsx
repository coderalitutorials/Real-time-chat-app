import React, { useState } from "react";
import { useSignupMutation } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignupForm = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("image", formData.image);

    try {
      const result = await signup(data).unwrap();
      toast.success("Signup Successful! 🎉 Redirecting to login...", { position: "top-right", autoClose: 3000 });
      
      // Navigate to login page after short delay (to show toast)
      setTimeout(() => {
        navigate("/login");
      }, 3000);

      console.log("Signup success:", result);
    } catch (err) {
      toast.error(err?.data?.message || "Signup failed!", { position: "top-right", autoClose: 3000 });
      console.error("Signup failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-red from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 shadow-xl rounded-2xl p-10 w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400 animate-pulse">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Profile Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full text-gray-300 bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-lg font-semibold text-lg transition duration-300"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-400 hover:underline">
            Login
          </a>
        </p>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default SignupForm;


