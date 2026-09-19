import { useParams, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { useOrderById } from "../../hooks/useOrders";
import { cancelOrder, confirmPayment } from "../../api/order";
import OrderDetailContent from "../../components/OrderDetailContent";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useOrderById(id);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["orders", "detail", id] });

  const cancelMutation = useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled");
      invalidate();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not cancel order");
    },
  });

  const payNowMutation = useMutation({
    mutationFn: (orderGroupId) => confirmPayment(orderGroupId),
    onSuccess: () => {
      toast.success("Payment confirmed");
      invalidate();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Payment failed");
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/customer/orders")}
        className="btn btn-sm btn-ghost mb-4"
      >
        <FiArrowLeft /> Back to Orders
      </button>

      {isLoading && <div className="skeleton h-96 rounded-box" />}

      {isError && (
        <p className="text-sm text-error">Could not load this order.</p>
      )}

      {order && (
        <OrderDetailContent
          order={order}
          onCancel={(orderId) => cancelMutation.mutate(orderId)}
          isCancelling={cancelMutation.isPending}
          onPayNow={(orderGroupId) => payNowMutation.mutate(orderGroupId)}
          isPayingNow={payNowMutation.isPending}
        />
      )}
    </div>
  );
};

export default OrderDetails;