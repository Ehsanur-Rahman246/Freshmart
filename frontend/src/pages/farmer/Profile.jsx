import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiTrash2, FiLogOut } from "react-icons/fi";
import { getFarmerProfile, updateFarmerProfile } from "../../api/farmer";
import { logout, deleteAccount } from "../../api/auth";
import ProfileHeader from "../../components/profile/shared/ProfileHeader";
import PersonalInfoCard from "../../components/profile/shared/PersonalInfoCard";
import EditInfoModal from "../../components/profile/shared/EditInfoModal";
import ChangePasswordModal from "../../components/profile/shared/ChangePasswordModal";
import DeleteAccountModal from "../../components/profile/shared/DeleteAccountModal";
import AvgReviewCard from "../../components/profile/farmer/AvgReviewCard";
import FarmsListCard from "../../components/profile/farmer/FarmsListCard";

const QUERY_KEY = ["farmerProfile"];

export default function FarmerProfile() {
  const { data: farmer, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await getFarmerProfile()).data.farmer,
  });

  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading || !farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

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

        <ProfileHeader
          profile={farmer}
          uploadFn={updateFarmerProfile}
          queryKey={QUERY_KEY}
        />
        <PersonalInfoCard
          profile={farmer}
          onEdit={() => setEditInfoOpen(true)}
          onChangePassword={() => setPasswordModalOpen(true)}
        />
        <AvgReviewCard />
        <FarmsListCard farms={farmer.farms} />

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
        <EditInfoModal profile={farmer} queryKey={QUERY_KEY} onClose={() => setEditInfoOpen(false)} />
      )}
      {passwordModalOpen && (
        <ChangePasswordModal email={farmer.user.email} onClose={() => setPasswordModalOpen(false)} />
      )}
      {deleteModalOpen && (
        <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteAccount} />
      )}
    </div>
  );
}