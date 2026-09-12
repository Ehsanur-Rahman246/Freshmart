import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCamera,
  FiEdit2,
  FiTrash2,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiPlus,
  FiCheck,
  FiLogOut,
} from "react-icons/fi";
import {
  getCustomerProfile,
  updateCustomerProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../api/customer";
import {
  updateProfile,
  sendResetOtp,
  verifyResetPasswordOtp,
  resetPassword,
  logout,
  deleteAccount,
} from "../../api/auth";

/* ---------------------------------------------------------
   SHARED SMALL PIECES
   --------------------------------------------------------- */

const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-muted">{label}</span>
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-field border border-theme bg-base-100 outline-none focus:border-primary disabled:bg-base-200 disabled:text-muted-light"
    />
  </label>
);

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay">
    <div className="w-full max-w-md bg-base-100 rounded-box shadow-xl p-6 relative">
      <button
        onClick={onClose}
        className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
      >
        <FiX />
      </button>
      <h3 className="text-lg font-bold mb-5">{title}</h3>
      {children}
    </div>
  </div>
);

/* ---------------------------------------------------------
   PROFILE HEADER (avatar + wallet)
   --------------------------------------------------------- */

const ProfileHeader = ({ customer }) => {
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
      await updateCustomerProfile(formData);
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
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
              {customer.profileImage?.url ? (
                <img src={customer.profileImage.url} alt={customer.user.name} />
              ) : (
                <div className="bg-primary-soft w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                  {customer.user.name?.[0]?.toUpperCase()}
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
          <h2 className="text-xl font-extrabold">{customer.user.name}</h2>
          <span className="badge badge-sm bg-primary-soft text-primary border-none capitalize">
            {customer.user.role}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="rounded-box bg-success-soft px-4 py-3 text-center min-w-27.5">
          <p className="text-xs text-muted">Points</p>
          <p className="text-lg font-bold text-success">
            <strong className="text-2xl">&#2547;</strong>{customer.pointsBalance}
          </p>
        </div>
        <div className="rounded-box bg-error-soft px-4 py-3 text-center min-w-27.5">
          <p className="text-xs text-muted">Debt</p>
          <p className="text-lg font-bold text-error"><strong className="text-2xl">-&#2547;</strong>{customer.debtBalance}</p>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   PERSONAL INFORMATION CARD
   --------------------------------------------------------- */

const PersonalInfoCard = ({ customer, onEdit, onChangePassword }) => (
  <div className="bg-base-100 border border-theme-light rounded-box p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-bold">Personal Information</h3>
      <button
        onClick={onEdit}
        className="btn btn-sm bg-secondary text-secondary-content gap-1"
      >
        <FiEdit2 size={14} /> Edit
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <div>
        <p className="text-xs text-muted mb-1">Full Name</p>
        <p className="font-semibold">{customer.user.name}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">Email Address</p>
        <p className="font-semibold">{customer.user.email}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">Phone Number</p>
        <p className="font-semibold">{customer.user.phone || "—"}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">User Role</p>
        <p className="font-semibold capitalize">{customer.user.role}</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-theme-light">
      <div>
        <p className="font-semibold text-sm">Password</p>
        <p className="text-xs text-muted">Change your account password</p>
      </div>
      <button
        onClick={onChangePassword}
        className="btn btn-sm btn-outline gap-1"
      >
        <FiLock size={14} /> Change Password
      </button>
    </div>
  </div>
);

/* ---------------------------------------------------------
   ADDRESSES CARD
   --------------------------------------------------------- */

const AddressesCard = ({ addresses, onAdd, onEdit }) => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["customerProfile"] });

  const handleDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Addresses</h3>
        <button
          onClick={onAdd}
          className="btn btn-sm bg-primary text-primary-content gap-1"
        >
          <FiPlus size={14} /> Add Address
        </button>
      </div>

      {addresses.length === 0 && (
        <p className="text-sm text-muted">No addresses added yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="border border-theme-light rounded-field p-4 flex justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">
                  {addr.label || "Address"}
                </span>
                {addr.isDefault && (
                  <span className="badge badge-xs bg-primary-soft text-primary border-none">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm">
                {addr.recipientName} · {addr.phone}
              </p>
              <p className="text-sm text-muted">
                {addr.village}, {addr.upazila}, {addr.district}, {addr.division}
              </p>
              <p className="text-sm text-muted">{addr.address}</p>
            </div>

            <div className="flex flex-col gap-2 items-end shrink-0">
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(addr._id)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="btn btn-ghost btn-xs btn-circle text-error"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr._id)}
                  className="btn btn-xs btn-outline gap-1"
                >
                  <FiCheck size={12} /> Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   EDIT PERSONAL INFO MODAL (name + phone only)
   --------------------------------------------------------- */

const EditInfoModal = ({ customer, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(customer.user.name || "");
  const [phone, setPhone] = useState(customer.user.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await updateProfile({ name, phone });
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
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
        <Field
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field label="Email Address" value={customer.user.email} disabled />
        <Field
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Field label="User Role" value={customer.user.role} disabled />
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

/* ---------------------------------------------------------
   CHANGE PASSWORD MODAL (send OTP -> verify -> reset)
   --------------------------------------------------------- */

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

/* ---------------------------------------------------------
   ADD / EDIT ADDRESS MODAL
   --------------------------------------------------------- */

const emptyAddress = {
  label: "",
  recipientName: "",
  phone: "",
  division: "",
  district: "",
  upazila: "",
  village: "",
  address: "",
};

const AddressModal = ({ address, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(address);
  const [form, setForm] = useState(
    address
      ? {
          label: address.label || "",
          recipientName: address.recipientName || "",
          phone: address.phone || "",
          division: address.division || "",
          district: address.district || "",
          upazila: address.upazila || "",
          village: address.village || "",
          address: address.address || "",
        }
      : emptyAddress,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      if (isEditing) {
        await updateAddress(address._id, form);
      } else {
        await addAddress(form);
      }
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title={isEditing ? "Edit Address" : "Add Address"}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        <Field
          label="Label"
          value={form.label}
          onChange={update("label")}
          placeholder="Home, Office..."
        />
        <Field
          label="Recipient Name"
          value={form.recipientName}
          onChange={update("recipientName")}
        />
        <Field label="Phone" value={form.phone} onChange={update("phone")} />
        <Field
          label="Division"
          value={form.division}
          onChange={update("division")}
        />
        <Field
          label="District"
          value={form.district}
          onChange={update("district")}
        />
        <Field
          label="Upazila"
          value={form.upazila}
          onChange={update("upazila")}
        />
        <Field
          label="Village"
          value={form.village}
          onChange={update("village")}
        />
        <Field
          label="Full Address"
          value={form.address}
          onChange={update("address")}
        />
      </div>

      {error && <p className="text-sm text-error mt-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn bg-primary text-primary-content w-full mt-4"
      >
        {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Address"}
      </button>
    </ModalShell>
  );
};

/* ---------------------------------------------------------
   DELETE ACCOUNT MODAL
   --------------------------------------------------------- */

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

/* ---------------------------------------------------------
   MAIN PAGE
   --------------------------------------------------------- */

export default function CustomerProfile() {
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: async () => (await getCustomerProfile()).data.customer,
  });

  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const editingAddress = customer.addresses.find(
    (a) => a._id === editingAddressId,
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login");
    }
  };

  const handleDeleteAccount = async (password) => {
    await deleteAccount({ password });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl mx-auto">Profile</h1>
        <ProfileHeader customer={customer} />
        <PersonalInfoCard
          customer={customer}
          onEdit={() => setEditInfoOpen(true)}
          onChangePassword={() => setPasswordModalOpen(true)}
        />
        <AddressesCard
          addresses={customer.addresses}
          onAdd={() => {
            setEditingAddressId(null);
            setAddressModalOpen(true);
          }}
          onEdit={(id) => {
            setEditingAddressId(id);
            setAddressModalOpen(true);
          }}
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button onClick={handleLogout} className="btn btn-outline gap-2">
            <FiLogOut size={16} /> Log Out
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="btn bg-error text-error-content gap-2"
          >
            <FiTrash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {editInfoOpen && (
        <EditInfoModal
          customer={customer}
          onClose={() => setEditInfoOpen(false)}
        />
      )}
      {passwordModalOpen && (
        <ChangePasswordModal
          email={customer.user.email}
          onClose={() => setPasswordModalOpen(false)}
        />
      )}
      {addressModalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setAddressModalOpen(false);
            setEditingAddressId(null);
          }}
        />
      )}
      {deleteModalOpen && (
        <DeleteAccountModal
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}
