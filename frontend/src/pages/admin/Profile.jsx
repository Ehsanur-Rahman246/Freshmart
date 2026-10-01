import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkAuth } from "../../api/auth";
import PersonalInfoCard from "../../components/PersonalInfoCard";
import EditInfoModal from "../../components/EditInfoModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import Loader from "../../components/Loader";
import CarbonFootprintDisplay from "../../components/CarbonFootprintDisplay";

const queryKey = ["adminProfile"];

const AdminProfile = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await checkAuth()).data.user,
  });

  if (isLoading || !user) {
    return <Loader />;
  }

  const profile = { user };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-base-100 border border-theme-light rounded-box p-6 flex items-center gap-5">
        <div className="avatar avatar-placeholder">
          <div className="w-20 h-20 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100 bg-primary-soft text-primary flex items-center justify-center text-2xl font-bold">
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold">{user.name}</h2>
          <span className="badge badge-sm bg-primary-soft text-primary border-none capitalize">
            {user.role}
          </span>
        </div>
      </div>

      <PersonalInfoCard
        profile={profile}
        onEdit={() => setShowEdit(true)}
        onChangePassword={() => setShowChangePassword(true)}
      />

      {showEdit && (
        <EditInfoModal
          profile={profile}
          queryKey={queryKey}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          email={user.email}
          onClose={() => setShowChangePassword(false)}
        />
      )}
      <CarbonFootprintDisplay />
    </div>
  );
};

export default AdminProfile;