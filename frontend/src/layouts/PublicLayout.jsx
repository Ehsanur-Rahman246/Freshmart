import { useState } from "react";
import { Outlet } from "react-router";
import { useViewer } from "../hooks/useViewer";
import HomeNavbar from "../components/HomeNavbar";
import CutomerNavbar from "../components/CustomerNavbar";
import FarmerNavbar from "../components/FarmerNavbar";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

const PublicLayout = () => {
  const { role } = useViewer();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (role === "admin") {
    return (
      <div className="min-h-screen bg-base-200">
        <AdminNavbar
          onMenuClick={() => setMobileOpen((prev) => !prev)}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <AdminSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50">
        {role === "guest" && <HomeNavbar />}
        {role === "customer" && <CutomerNavbar />}
        {role === "farmer" && <FarmerNavbar />}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;