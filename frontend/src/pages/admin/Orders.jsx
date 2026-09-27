import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import OrderList from "../../components/OrderList";
import OrderDrawer from "../../components/OrderDrawer";
import { useAllOrdersLive } from "../../hooks/useOrders";
import { adminCancelNoDriver } from "../../api/order";

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useAllOrdersLive();

  const adminCancelMutation = useMutation({
    mutationFn: (orderId) => adminCancelNoDriver(orderId),
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(null);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not cancel order"),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Orders</h1>
        <p className="text-sm text-muted-light mt-1">
          All orders placed across the platform
        </p>
      </div>

      <OrderList
        orders={orders}
        isLoading={isLoading}
        onSelect={setSelectedOrder}
      />

      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAdminCancelNoDriver={(orderId) => adminCancelMutation.mutate(orderId)}
        isAdminCancelling={adminCancelMutation.isPending}
      />
    </div>
  );
};

export default AdminOrders;
