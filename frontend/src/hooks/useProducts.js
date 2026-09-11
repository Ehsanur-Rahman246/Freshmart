import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/product";

export const useProducts = (page, limit = 10) =>
  useQuery({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const { data } = await getProducts(page, limit);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });