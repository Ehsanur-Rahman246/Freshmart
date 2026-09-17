import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiTrash2, FiLogOut } from "react-icons/fi";
import { getCustomerProfile, updateCustomerProfile } from "../../api/customer";
import { logout, deleteAccount } from "../../api/auth";
import ProfileHeader from "../../components/profile/shared/ProfileHeader";
import PersonalInfoCard from "../../components/profile/shared/PersonalInfoCard";
import EditInfoModal from "../../components/profile/shared/EditInfoModal";
import ChangePasswordModal from "../../components/profile/shared/ChangePasswordModal";
import DeleteAccountModal from "../../components/profile/shared/DeleteAccountModal";
import WalletSummary from "../../components/profile/customer/WalletSummary";
import AddressesCard from "../../components/profile/customer/AddressesCard";
import AddressModal from "../../components/profile/customer/AddressModal";

const QUERY_KEY = ["customerProfile"];

export default function CustomerProfile() {
  const { data: customer, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await getCustomerProfile()).data.customer,
  });

  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const editingAddress = customer.addresses.find((a) => a._id === editingAddressId);

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
          profile={customer}
          uploadFn={updateCustomerProfile}
          queryKey={QUERY_KEY}
          walletSlot={<WalletSummary customer={customer} />}
        />
        <PersonalInfoCard
          profile={customer}
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
        <EditInfoModal profile={customer} queryKey={QUERY_KEY} onClose={() => setEditInfoOpen(false)} />
      )}
      {passwordModalOpen && (
        <ChangePasswordModal email={customer.user.email} onClose={() => setPasswordModalOpen(false)} />
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
        <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteAccount} />
      )}
    </div>
  );
}