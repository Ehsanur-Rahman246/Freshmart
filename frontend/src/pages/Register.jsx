import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FiUser,
  FiLock,
  FiPhone,
  FiMail,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
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

export default function Register() {
  const navigate = useNavigate();

  // State
  const [type, setType] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Navigate user after registration
  const goToPage = (user) => {
    localStorage.setItem("userCurrentDetails", JSON.stringify(user));
    if (user.role === "farmer") {
      navigate("/home");
    } else {
      navigate("/marketplace");
    }
  };

  // Register function
  const createAccount = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !phone || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          name,
          email,
          phone,
          password,
          role: type,
        },
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
        setError(error.response.data.message || "Registration failed. Please try again.");
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
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted text-sm mt-1">Create your FreshMart account</p>
        </div>

        {/* Register Form */}
        <form onSubmit={createAccount} className="space-y-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary"
          >
            <FiArrowLeft />
            Back to Login
          </button>

          <div>
            <p className="text-sm font-medium mb-2">Account Type</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("customer")}
                className={`py-3 rounded-xl border ${
                  type === "customer"
                    ? "border-primary bg-primary-soft"
                    : "border-theme"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setType("farmer")}
                className={`py-3 rounded-xl border ${
                  type === "farmer"
                    ? "border-primary bg-primary-soft"
                    : "border-theme"
                }`}
              >
                Farmer
              </button>
            </div>
          </div>

          <Input
            icon={FiUser}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            icon={FiPhone}
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

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
            {loading ? "Creating Account..." : (
              <>
                Create Account
                <FiArrowRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}