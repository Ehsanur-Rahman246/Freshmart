import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { checkAuth } from "../api/auth";
import Loader from "./Loader";
import { connectSocket } from "../api/socket";

const ProtectedRoute = ({ role }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await checkAuth();

        if (data.success) {
          setUser(data.user);
          connectSocket();
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // NEW: force unverified customers/farmers to verify before using the app
  if (
    (user.role === "customer" || user.role === "farmer") &&
    !user.isAccountVerified
  ) {
    return <Navigate to="/verify-account" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
