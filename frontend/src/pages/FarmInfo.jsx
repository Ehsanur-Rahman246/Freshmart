import { useQuery } from "@tanstack/react-query";
import FarmCard from "../components/FarmCard";
import { getAllFarms } from "../api/farm";
import Loader from "../components/Loader";
import { useViewer } from "../hooks/useViewer";
import CutomerNavbar from "../components/CustomerNavbar";
import HomeNavbar from "../components/HomeNavbar";
import AdminNavbar from "../components/AdminNavbar";
import FarmerNavbar from "../components/FarmerNavbar";
import { useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";

const FarmInfo = () => {
  const { role } = useViewer();

  const isCustomer = role === "customer";
  const isGuest = role === "guest";
  const isAdmin = role === "admin";
  const isFarmer = role === "farmer";
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["farms", query],
    queryFn: async () => {
      const { data } = await getAllFarms(query);
      return data.farms;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Loader />;

  return (
    <>
      <nav className="sticky top-0 z-50">
        {isCustomer && <CutomerNavbar />}
        {isGuest && <HomeNavbar />}
        {isAdmin && <AdminNavbar />}
        {isFarmer && <FarmerNavbar />}
      </nav>
      <main className="p-4">
        {!isCustomer && (
          <div className="w-full max-w-xl mb-6">
            <SearchBar mode="farms" resultsBasePath="/farms" />
          </div>
        )}
        <h1 className="text-2xl mb-4">Freshmart Farms</h1>
        <div className="flex flex-wrap gap-3">
          {data?.map((farm) => (
            <FarmCard key={farm._id} farm={farm} to={`/farms/${farm._id}`} />
          ))}
        </div>
      </main>
    </>
  );
};

export default FarmInfo;
