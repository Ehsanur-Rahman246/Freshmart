import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getAllPromoCodes,
  createPromoCode as createPromoCodeApi,
  updatePromoCode as updatePromoCodeApi,
} from "../api/promoCode";

export const usePromoCodes = () =>
  useQuery({
    queryKey: ["promoCodes", "admin"],
    queryFn: async () => (await getAllPromoCodes()).data.promoCodes,
    staleTime: 1000 * 30,
  });

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createPromoCodeApi(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["promoCodes", "admin"] }),
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promoCodeId, data }) =>
      updatePromoCodeApi(promoCodeId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["promoCodes", "admin"] }),
  });
};
