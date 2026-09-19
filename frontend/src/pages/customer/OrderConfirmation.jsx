import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";
import { useOrderById } from "../../hooks/useOrders";
import { cancelOrder, confirmPayment } from "../../api/order";
import OrderDetailContent from "../../components/OrderDetailContent";
import Loader from "../../components/Loader";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Right after checkout: full order objects arrive via navigate state
  // (createOrder already returned them populated, no extra fetch needed).
  const [stateOrders, setStateOrders] = useState(
    location.state?.orders || null,
  );

  // Reached from the Orders list instead — a single order id in the URL.
  const { data: fetchedOrder, isLoading } = useOrderById(
    stateOrders ? null : id,
  );

  const cancelMutation = useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: (response, orderId) => {
      toast.success("Order cancelled");

      if (stateOrders) {
        setStateOrders((prev) =>
          prev.map((o) => (o._id === orderId ? response.data.order : o)),
        );
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not cancel order");
    },
  });

  const payNowMutation = useMutation({
    mutationFn: (orderGroupId) => confirmPayment(orderGroupId),
    onSuccess: (response) => {
      toast.success("Payment confirmed");

      if (stateOrders) {
        const updatedById = new Map(
          response.data.orders.map((o) => [o._id, o]),
        );

        setStateOrders((prev) => prev.map((o) => updatedById.get(o._id) || o));
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Payment failed");
    },
  });

  if (!stateOrders && !id) {
    navigate("/customer/orders", { replace: true });
    return null;
  }

  if (!stateOrders && isLoading) {
    return <Loader />;
  }

  const orders = stateOrders || (fetchedOrder ? [fetchedOrder] : null);

  if (!orders || orders.length === 0) {
    navigate("/customer/orders", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {stateOrders && (
          <div className="mb-2 flex flex-col items-center gap-2 text-center">
            <FiCheckCircle className="text-4xl text-success" />
            <h1 className="text-2xl font-extrabold">Order Placed!</h1>
            <p className="text-sm text-muted">
              {orders.length > 1
                ? `Your order has been split into ${orders.length} orders, one per farm.`
                : "Here are your order details."}
            </p>
          </div>
        )}

        {orders.map((order) => (
          <OrderDetailContent
            key={order._id}
            order={order}
            onCancel={(orderId) => cancelMutation.mutate(orderId)}
            isCancelling={cancelMutation.isPending}
            onPayNow={(orderGroupId) => payNowMutation.mutate(orderGroupId)}
            isPayingNow={payNowMutation.isPending}
          />
        ))}

        <button
          type="button"
          onClick={() => navigate("/customer/orders")}
          className="btn btn-primary w-full"
        >
          Go to My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;