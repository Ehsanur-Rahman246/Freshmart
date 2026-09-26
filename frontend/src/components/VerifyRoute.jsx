import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { checkAuth } from "../api/auth";
import Loader from "./Loader";

const DASHBOARD_PATH = {
  customer: "/customer",
  farmer: "/farmer",
  admin: "/admin",
};

const VerifyRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await checkAuth();
        if (data.success) setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "customer" && user.role !== "farmer") {
    return <Navigate to={DASHBOARD_PATH[user.role] || "/"} replace />;
  }

  if (user.isAccountVerified) {
    return <Navigate to={DASHBOARD_PATH[user.role]} replace />;
  }

  return <Outlet />;
};

export default VerifyRoute;
