import { useState } from "react";
import { resetPassword, sendResetOtp, verifyResetPasswordOtp } from "../../../api/auth";
import ModalShell from "./ModalShell";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import Field from "./Field";

const ChangePasswordModal = ({ email, onClose }) => {
  const [step, setStep] = useState(1); // 1: confirm+send, 2: otp, 3: new password
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await sendResetOtp({ email });
      if (data.success) {
        setSuccess("OTP sent to your email.");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await verifyResetPasswordOtp({ email, otp });
      if (data.success) {
        setResetToken(data.resetToken);
        setSuccess("");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword({ resetToken, newPassword });
      if (data.success) {
        setSuccess("Password changed successfully.");
        setTimeout(onClose, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Change Password" onClose={onClose}>
      {error && (
        <div className="mb-4 p-2.5 rounded-field bg-error-soft text-sm text-error">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-2.5 rounded-field bg-success-soft text-sm text-success">
          {success}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            We'll send a one-time code to <strong>{email}</strong> to verify
            it's you before changing your password.
          </p>
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="btn bg-primary text-primary-content w-full gap-2"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send OTP <FiArrowRight />
              </>
            )}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="text-muted text-sm flex justify-center">
            Enter the 6-digit code
          </label>
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
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="btn bg-primary text-primary-content w-full gap-2"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                Verify OTP <FiArrowRight />
              </>
            )}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted">
              New Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pr-10 px-3.5 py-2.5 rounded-field border border-theme bg-base-100 outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>
          <Field
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="btn bg-secondary text-secondary-content w-full"
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </div>
      )}
    </ModalShell>
  );
};

export default ChangePasswordModal;