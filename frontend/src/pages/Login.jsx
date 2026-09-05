import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FiUser,
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";

// API base URL
const API_URL = import.meta.env.VITE_API_URL + "/api/auth";

// Input component
const Input = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  right,
}) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-11 pr-11 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
    />
    {right}
  </div>
);

export default function Login() {
  const navigate = useNavigate();

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Navigate user after login
  const goToPage = (user) => {
    localStorage.setItem("userCurrentDetails", JSON.stringify(user));
    if (user.role === "farmer") {
      navigate("/home");
    } else {
      navigate("/marketplace");
    }
  };

  // Login function
  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        const { user } = response.data;
        localStorage.setItem("userCurrentDetails", JSON.stringify(user));
        goToPage(user);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Login failed. Please try again.");
      } else if (error.request) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary-soft flex items-center justify-center mb-3">
            <FiUser className="text-2xl text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted text-sm mt-1">Login to your FreshMart account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={login} className="space-y-4">
          <Input
            icon={FiMail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            icon={FiLock}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            }
          />

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <p className="text-sm text-error bg-error-soft p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Logging in..." : (
              <>
                Login
                <FiArrowRight />
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 border-t border-theme" />
            <span className="text-xs text-muted">OR</span>
            <div className="flex-1 border-t border-theme" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full py-3 rounded-xl border border-theme hover:border-primary"
          >
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
}