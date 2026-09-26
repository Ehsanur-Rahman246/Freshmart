import { FiEdit2, FiLock } from "react-icons/fi";

const PersonalInfoCard = ({ profile, onEdit, onChangePassword }) => (
  <div className="bg-base-100 border border-theme-light rounded-box p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-bold">Personal Information</h3>
      <button onClick={onEdit} className="btn btn-sm bg-secondary text-secondary-content gap-1">
        <FiEdit2 size={14} /> Edit
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <div>
        <p className="text-xs text-muted mb-1">Full Name</p>
        <p className="font-semibold">{profile.user.name}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">Email Address</p>
        <p className="font-semibold">{profile.user.email}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">Phone Number</p>
        <p className="font-semibold">{profile.user.phone || "—"}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">User Role</p>
        <p className="font-semibold capitalize">{profile.user.role}</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-theme-light">
      <div>
        <p className="font-semibold text-sm">Password</p>
        <p className="text-xs text-muted">Change your account password</p>
      </div>
      <button onClick={onChangePassword} className="btn btn-sm btn-outline gap-1">
        <FiLock size={14} /> Change Password
      </button>
    </div>
  </div>
);

export default PersonalInfoCard;