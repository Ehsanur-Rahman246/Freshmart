import { useQuery } from "@tanstack/react-query";
import { checkAuth } from "../api/auth";

// Central place to know "who is looking at this page" — guest, customer,
// or farmer. Reuses the same checkAuth call ProtectedRoute/GuestRoute use.
export const useViewer = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["viewer"],
    queryFn: async () => {
      try {
        const { data } = await checkAuth();
        return data.success ? data.user : null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return { role: data?.role ?? "guest", user: data ?? null, isLoading };
};