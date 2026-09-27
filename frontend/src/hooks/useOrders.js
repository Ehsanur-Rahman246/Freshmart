import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyOrders, getFarmerOrders, getOrderById, getAllOrders, getOrderGroup } from "../api/order";
import { useSocket } from "./useSocket";

export const useMyOrders = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["orders", "customer", "mine"],
    queryFn: async () => {
      const { data } = await getMyOrders();
      return data.orders;
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket) return;

    const onStatusChanged = (payload) => {
      queryClient.setQueryData(["orders", "customer", "mine"], (old) => {
        if (!old) return old;
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
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, queryClient]);

  return query;
};

export const useFarmerOrders = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["orders", "farmer", "mine"],
    queryFn: async () => {
      const { data } = await getFarmerOrders();
      return data.orders;
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket) return;

    const onStatusChanged = (payload) => {
      queryClient.setQueryData(["orders", "farmer", "mine"], (old) => {
        if (!old) return old;
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
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, queryClient]);

  return query;
};

export const useOrderById = (orderId) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: async () => {
      const { data } = await getOrderById(orderId);
      return data.order;
    },
    enabled: Boolean(orderId),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket || !orderId) return;

    const onStatusChanged = (payload) => {
      if (payload.orderId !== orderId) return;

      queryClient.setQueryData(["orders", "detail", orderId], (old) =>
        old
          ? {
              ...old,
              status: payload.newStatus,
              delivery: {
                ...old.delivery,
                nextTransitionAt: payload.nextTransitionAt,
              },
            }
          : old,
      );
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, orderId, queryClient]);

  return query;
};

export const useOrderGroup = (orderGroupId) => {
  const queryClient = useQueryClient();
  const socket = useSocket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key = ["orders", "group", orderGroupId];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => (await getOrderGroup(orderGroupId)).data.orders,
    enabled: Boolean(orderGroupId),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket || !orderGroupId) return;

    const onStatusChanged = (payload) => {
      const known = queryClient.getQueryData(key)?.some((o) => o._id === payload.orderId);
      if (known) queryClient.invalidateQueries({ queryKey: key });
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, key, orderGroupId, queryClient]);

  return query;
};

export const useAllOrdersLive = (params) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["orders", "admin", "all", params],
    queryFn: async () => {
      const { data } = await getAllOrders(params);
      return data.orders;
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket) return;

    const onStatusChanged = (payload) => {
      queryClient.setQueryData(["orders", "admin", "all", params], (old) => {
        if (!old) return old;
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
    };

    socket.on("order:statusChanged", onStatusChanged);
    return () => socket.off("order:statusChanged", onStatusChanged);
  }, [socket, params, queryClient]);

  return query;
};
