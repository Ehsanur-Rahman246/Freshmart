import { Outlet } from "react-router";
import CustomerNavbar from "../components/CustomerNavbar";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
