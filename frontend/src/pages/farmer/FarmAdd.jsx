import { useNavigate } from "react-router";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import FarmDetailsForm from "../../forms/FarmDetailsForm";

const FarmAdd = () => {
  const navigate = useNavigate();

  const handleCreated = (farm) => {
    navigate(`/farmer/farms/${farm._id}`);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/farmer/farms", { replace: true })}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-theme bg-base-200 text-muted hover:border-primary hover:text-primary"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme">
          <div>
            <h1 className="text-3xl font-extrabold">Add a New Farm</h1>
            <p className="text-sm text-muted mt-1">Tell us about your farm</p>
          </div>
          <FiHome size={30} className="text-primary" />
        </div>

        <FarmDetailsForm mode="create" onSuccess={handleCreated} />
      </main>
    </div>
  );
};

export default FarmAdd;