import { Outlet } from "react-router";
import FarmerNavbar from "../components/FarmerNavbar";
import Footer from "../components/Footer";

const FarmerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <FarmerNavbar />

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default FarmerLayout;
