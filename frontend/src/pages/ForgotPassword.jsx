import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FiMail, FiLock, FiArrowLeft, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";

const API_URL = "http://localhost:5000/api/auth";

const Input = ({ icon: Icon, type = "text", placeholder, value, onChange, right }) => (
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const sendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/send-reset-otp`, { email });
      if (data.success) {
        setSuccess("OTP sent to your email!");
        setStep(2);
        setTimer(60);
        setCanResend(false);
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otp) { setError("Please enter OTP."); setLoading(false); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); setLoading(false); return; }

    try {
      const { data } = await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
      if (data.success) {
        setSuccess("Password reset successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/send-reset-otp`, { email });
      if (data.success) {
        setSuccess("OTP resent!");
        setTimer(60);
        setCanResend(false);
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary-soft flex items-center justify-center mb-3">
            <FiLock className="text-2xl text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted text-sm mt-1">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-error-soft text-sm text-error">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-success-soft text-sm text-success">{success}</div>}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={sendOTP} className="space-y-4">
            <Input icon={FiMail} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" disabled={loading} className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Sending..." : <>Send OTP <FiArrowRight /></>}
            </button>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-theme" />
              <span className="text-xs text-muted">OR</span>
              <div className="flex-1 border-t border-theme" />
            </div>
            <button type="button" onClick={() => navigate("/login")} className="w-full py-3 rounded-xl border border-theme hover:border-primary flex items-center justify-center gap-2">
              <FiArrowLeft /> Back to Login
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <Input icon={FiMail} type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button type="submit" disabled={loading} className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Verifying..." : <>Verify OTP <FiArrowRight /></>}
            </button>
            <div className="text-center">
              <button type="button" onClick={resendOTP} disabled={!canResend || loading} className={`text-sm ${canResend ? "text-primary hover:underline" : "text-muted"} disabled:opacity-50`}>
                {canResend ? "Resend OTP" : `Resend in ${timer}s`}
              </button>
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-theme" />
              <span className="text-xs text-muted">OR</span>
              <div className="flex-1 border-t border-theme" />
            </div>
            <button type="button" onClick={() => navigate("/login")} className="w-full py-3 rounded-xl border border-theme hover:border-primary flex items-center justify-center gap-2">
              <FiArrowLeft /> Back to Login
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <Input 
              icon={FiLock} 
              type={showPassword ? "text" : "password"} 
              placeholder="New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              right={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              }
            />
            <Input 
              icon={FiLock} 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              right={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              }
            />
            <button type="submit" disabled={loading} className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Resetting..." : <>Reset Password <FiArrowRight /></>}
            </button>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-theme" />
              <span className="text-xs text-muted">OR</span>
              <div className="flex-1 border-t border-theme" />
            </div>
            <button type="button" onClick={() => navigate("/login")} className="w-full py-3 rounded-xl border border-theme hover:border-primary flex items-center justify-center gap-2">
              <FiArrowLeft /> Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}