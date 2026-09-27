import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import toast from "react-hot-toast";
import { checkAuth } from "../api/auth";
import Loader from "./Loader";

const GuestRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("accountDisabledRedirect")) {
      sessionStorage.removeItem("accountDisabledRedirect");
      toast.error("Your account has been disabled.");
    }
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await checkAuth();

        if (data.success) {
          setUser(data.user);
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

  if (user) {
    if (user.role === "customer") {
      return <Navigate to="/customer" replace />;
    }

    if (user.role === "farmer") {
      return <Navigate to="/farmer" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
};

export default GuestRoute;
