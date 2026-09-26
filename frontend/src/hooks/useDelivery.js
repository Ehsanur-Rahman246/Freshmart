import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOngoingDeliveries,
  getOrdersAwaitingAssignment,
} from "../api/delivery";
import { useSocket } from "./useSocket";

export const useOngoingDeliveries = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["delivery", "ongoing"],
    queryFn: async () => {
      const { data } = await getOngoingDeliveries();
      return data.orders;
    },
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    if (!socket) return;

    const onStatusChanged = (payload) => {
      // instant patch so rapid transitions never get lost to a superseded refetch
      queryClient.setQueryData(["delivery", "ongoing"], (old) => {
        if (!old) return old;

        if (payload.newStatus === "delivered") {
          return old.filter((order) => order._id !== payload.orderId);
        }

        return old.map((order) =>
          order._id === payload.orderId
            ? {
                ...order,
                status: payload.newStatus,
                delivery: {
                  ...order.delivery,
                  nextTransitionAt: payload.nextTransitionAt,
                },
              }
            : order,
        );
      });

      // catches things the payload doesn't carry (driver assignment, new entrants)
      queryClient.invalidateQueries({ queryKey: ["delivery", "ongoing"] });
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, queryClient]);

  return query;
};

export const useOrdersAwaitingAssignment = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["delivery", "awaitingAssignment"],
    queryFn: async () => {
      const { data } = await getOrdersAwaitingAssignment();
      return data.orders;
    },
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    if (!socket) return;

    const onStatusChanged = () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery", "awaitingAssignment"],
      });
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, queryClient]);

  return query;
};
