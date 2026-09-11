import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { checkAuth } from "../lib/auth";
import Loader from "./Loader";

const GuestRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
    return <Loader/>;
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