import { useQuery } from "@tanstack/react-query";
import FarmCard from "../../components/FarmCard";
import { getMyFarms } from "../../api/farm";
import { Link } from "react-router";

const Farms = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["myFarms"],
    queryFn: async () => {
      const { data } = await getMyFarms();
      return data.farms;
    },
  });

  if (isLoading) return <p className="p-4">Loading your farms...</p>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">My Farms</h1>
        <Link to="/farmer/farms/new" className="btn btn-primary">
          + Add Farm
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {data?.length === 0 && (
          <p className="text-muted text-sm">You haven't added any farms yet.</p>
        )}
        {data?.map((farm) => (
          <FarmCard
            key={farm._id}
            farm={farm}
            to={`/farmer/farms/${farm._id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Farms;
