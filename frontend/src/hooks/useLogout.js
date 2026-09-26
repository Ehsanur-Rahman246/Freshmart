import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../api/auth";
import { disconnectSocket } from "../api/socket";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      disconnectSocket();

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
