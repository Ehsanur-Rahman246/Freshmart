import { useNavigate } from "react-router";
import FarmDetailsForm from "../../forms/FarmDetailsForm";

const FarmAdd = () => {
  const navigate = useNavigate();

  const handleCreated = (farm) => {
    navigate(`/farmer/farms/${farm._id}`);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl">Add a New Farm</h1>
      <FarmDetailsForm mode="create" onSuccess={handleCreated} />
    </div>
  );
};

export default FarmAdd;