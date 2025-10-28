import React, { useState } from "react";
import { useLoginMutation } from "../api/authApi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";

const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(credentials).unwrap();
      dispatch(loginSuccess(result));
      toast.success("Login Successful! 🎉 Redirecting...", { position: "top-right", autoClose: 3000 });

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);

      console.log("Login success:", result);
    } catch (err) {
      toast.error(err?.data?.message || "Login failed!", { position: "top-right", autoClose: 3000 });
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-red from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 shadow-2xl rounded-2xl p-10 w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400 animate-pulse">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={credentials.email}
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
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-lg font-semibold text-lg transition duration-300"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default LoginForm;



