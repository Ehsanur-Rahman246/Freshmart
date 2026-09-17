import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../../../api/auth";
import Field from "./Field";
import ModalShell from "./ModalShell";

const EditInfoModal = ({ profile, queryKey, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile.user.name || "");
  const [phone, setPhone] = useState(profile.user.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await updateProfile({ name, phone });
      queryClient.invalidateQueries({ queryKey });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Edit Personal Information" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <Field label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email Address" value={profile.user.email} disabled />
        <Field label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Field label="User Role" value={profile.user.role} disabled />
      </div>

      {error && <p className="text-sm text-error mb-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn bg-secondary text-secondary-content w-full mt-2"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </ModalShell>
  );
};

export default EditInfoModal;