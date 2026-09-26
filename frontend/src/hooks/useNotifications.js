import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyNotifications } from "../api/notification";
import { useSocket } from "./useSocket";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await getMyNotifications();
      return data.notifications;
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket) return;

    const onNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("notification:new", onNewNotification);
    return () => socket.off("notification:new", onNewNotification);
  }, [socket, queryClient]);

  return query;
};
