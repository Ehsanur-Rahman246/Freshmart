import { useQuery } from "@tanstack/react-query";
import { checkAuth } from "../api/auth";
import { connectSocket } from "../api/socket";

export const useViewer = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["viewer"],
    queryFn: async () => {
      try {
        const { data } = await checkAuth();
        console.log("checkAuth result:", data);
        if (data.success) {
          connectSocket();
          console.log("connectSocket called");
          return data.user;
        }
        return null;
      } catch (err) {
        console.log("checkAuth threw:", err);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return { role: data?.role ?? "guest", user: data ?? null, isLoading };
};
