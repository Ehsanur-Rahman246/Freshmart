import { useQuery } from "@tanstack/react-query";
import FarmCard from "../components/FarmCard";
import { getAllFarms } from "../api/farm";
import Loader from "../components/Loader";

const FarmInfo = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["farms"],
    queryFn: async () => {
      const { data } = await getAllFarms();
      return data.farms;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Loader/>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Our Farms</h1>
      <div className="flex flex-wrap gap-3">
        {data?.map((farm) => (
          <FarmCard key={farm._id} farm={farm} to={`/farms/${farm._id}`} />
        ))}
      </div>
    </div>
  );
};

export default FarmInfo;