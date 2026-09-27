import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiCamera } from "react-icons/fi";

const ProfileHeader = ({ profile, uploadFn, queryKey, walletSlot }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      await uploadFn(formData);
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-6 flex items-center justify-between gap-6 flex-wrap">
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center gap-2">
          <div className="avatar">
            <div className="w-20 h-20 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100">
              {profile.profileImage?.url ? (
                <img src={profile.profileImage.url} alt={profile.user.name} />
              ) : (
                <div className="bg-primary-soft w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                  {profile.user.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-ghost btn-xs gap-1 text-muted"
          >
            <FiCamera />
            {uploading ? "Updating..." : "Edit Photo"}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-extrabold">{profile.user.name}</h2>
          <span className="badge badge-sm bg-primary-soft text-primary border-none capitalize">
            {profile.user.role}
          </span>
        </div>
      </div>

      {walletSlot && <div className="flex gap-3">{walletSlot}</div>}
    </div>
  );
};

export default ProfileHeader;