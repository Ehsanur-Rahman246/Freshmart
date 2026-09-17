import { useState } from "react";
import ModalShell from "./ModalShell";
import Field from "./Field";

const DeleteAccountModal = ({ onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Delete Account" onClose={onClose}>
      <p className="text-sm text-muted mb-4">
        This action is permanent and cannot be undone. Enter your password to
        confirm.
      </p>
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-error mt-3">{error}</p>}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="btn bg-error text-error-content w-full mt-4"
      >
        {loading ? "Deleting..." : "Confirm Delete"}
      </button>
    </ModalShell>
  );
};

export default DeleteAccountModal;