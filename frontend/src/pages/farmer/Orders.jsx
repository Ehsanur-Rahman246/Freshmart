import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useFarmerOrders } from "../../hooks/useOrders";
import { acceptOrder, rejectOrder, updateOrderStatus } from "../../api/order";
import OrderList from "../../components/OrderList";
import OrderDrawer from "../../components/OrderDrawer";

const FarmerOrders = () => {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useFarmerOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const acceptMutation = useMutation({
    mutationFn: (orderId) => acceptOrder(orderId),
    onSuccess: () => {
      toast.success("Order accepted");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to accept"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orderId, reason }) => rejectOrder(orderId, reason),
    onSuccess: () => {
      toast.success("Order rejected");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to reject"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (orderId) =>
      updateOrderStatus(orderId, { status: "readyForPickup" }),
    onSuccess: () => {
      toast.success("Order marked ready for pickup");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(null);
    },
    onError: (e) =>
      toast.error(e?.response?.data?.message || "Failed to update status"),
  });

  return (
    <div className="p-4 md:p-8">
      <OrderList orders={orders} isLoading={isLoading} onSelect={setSelectedOrder} />

      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAccept={(id) => acceptMutation.mutate(id)}
        onReject={(id, reason) => rejectMutation.mutate({ orderId: id, reason })}
        isAccepting={acceptMutation.isPending}
        isRejecting={rejectMutation.isPending}
        onUpdateStatus={(id) => updateStatusMutation.mutate(id)}
        isUpdatingStatus={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default FarmerOrders;