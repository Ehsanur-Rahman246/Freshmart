import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { checkAuth } from "../lib/auth";

const ProtectedRoute = ({ role }) => {
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
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
