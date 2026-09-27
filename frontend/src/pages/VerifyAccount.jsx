import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiMail, FiPhone, FiArrowRight, FiLogOut, FiTrash2 } from "react-icons/fi";
import {
  checkAuth,
  updateProfile,
  sendVerificationOtp,
  verifyAccount,
  deleteAccount,
} from "../api/auth";
import { disconnectSocket } from "../api/socket";
import useLogout from "../hooks/useLogout";
import Footer from "../components/Footer";
import DeleteAccountModal from "../components/DeleteAccountModal";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleLogout = useLogout();

  const { data: user, refetch } = useQuery({
    queryKey: ["viewer"],
    queryFn: async () => (await checkAuth()).data.user,
  });

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const hasPhone = Boolean(user?.phone);

  const handleSavePhone = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await updateProfile({ phone });
      if (data.success) {
        await refetch();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await sendVerificationOtp();
      if (data.success) {
        setSuccess("OTP sent to your email.");
        setOtpSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await verifyAccount({ otp });
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["viewer"] });
        navigate(user.role === "farmer" ? "/farmer" : "/customer");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (password) => {
    const { data } = await deleteAccount({ password });
    if (data.success) {
      disconnectSocket();
      queryClient.invalidateQueries({ queryKey: ["viewer"] });
      navigate("/login");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 mr-2" />
          <div className="logo text-2xl">FreshMart</div>
        </div>

        <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary-soft flex items-center justify-center mb-3">
              <FiMail className="text-2xl text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Verify Your Account</h1>
            <p className="text-muted text-sm mt-1">
              {!hasPhone
                ? "Add your phone number to continue"
                : !otpSent
                ? "Send a verification code to your email"
                : "Enter the code sent to your email"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-soft text-sm text-error">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-success-soft text-sm text-success">
              {success}
            </div>
          )}

          {!hasPhone && (
            <form onSubmit={handleSavePhone} className="space-y-4">
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    Continue <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          {hasPhone && !otpSent && (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send OTP <FiArrowRight />
                </>
              )}
            </button>
          )}

          {hasPhone && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-center">
                <label className="otp otp-primary">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn bg-primary text-primary-content w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify OTP <FiArrowRight />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Resend OTP
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-theme" />
            <span className="text-xs text-muted">ACCOUNT</span>
            <div className="flex-1 border-t border-theme" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleLogout} className="btn btn-outline flex-1 gap-2">
              <FiLogOut /> Log Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn bg-error text-error-content flex-1 gap-2"
            >
              <FiTrash2 /> Delete Account
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}