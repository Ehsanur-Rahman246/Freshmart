import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../api/auth";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();

      queryClient.invalidateQueries({
        queryKey: ["viewer"],
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return handleLogout;
};

export default useLogout;