import { useQuery } from "@tanstack/react-query";
import { getMyOrders, getFarmerOrders, getOrderById } from "../api/order";

export const useMyOrders = () =>
  useQuery({
    queryKey: ["orders", "customer", "mine"],
    queryFn: async () => {
      const { data } = await getMyOrders();
      return data.orders;
    },
    staleTime: 1000 * 30,
  });

export const useFarmerOrders = () =>
  useQuery({
    queryKey: ["orders", "farmer", "mine"],
    queryFn: async () => {
      const { data } = await getFarmerOrders();
      return data.orders;
    },
    staleTime: 1000 * 30,
  });

export const useOrderById = (orderId) =>
  useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: async () => {
      const { data } = await getOrderById(orderId);
      return data.order;
    },
    enabled: Boolean(orderId),
    staleTime: 1000 * 30,
  });