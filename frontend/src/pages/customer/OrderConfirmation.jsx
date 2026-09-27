import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";
import { useOrderGroup } from "../../hooks/useOrders";
import { cancelOrder, confirmPayment } from "../../api/order";
import OrderDetailContent from "../../components/OrderDetailContent";
import Loader from "../../components/Loader";
import { useMemo } from "react";

const DROPPED = ["rejected", "cancelled"];
const PRE_PAYMENT = ["pendingAcceptance", "orderPlaced", "paymentPending"];

const OrderConfirmation = () => {
  const { id: orderGroupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError } = useOrderGroup(orderGroupId);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const cancelMutation = useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled");
      refresh();
    },
    onError: (e) =>
      toast.error(e?.response?.data?.message || "Could not cancel order"),
  });

  const payMutation = useMutation({
    mutationFn: () => confirmPayment(orderGroupId),
    onSuccess: () => {
      toast.success("Payment confirmed");
      refresh();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Payment failed"),
  });

  const active = useMemo(() => orders.filter((o) => !DROPPED.includes(o.status)), [orders]);
  const stillPrePayment = orders.some((o) => PRE_PAYMENT.includes(o.status));

  // Nothing left before payment -> leave this page
  useEffect(() => {
    if (isLoading || orders.length === 0 || stillPrePayment) return;
    navigate(
      active.length === 1
        ? `/customer/orders/${active[0]._id}`
        : "/customer/orders",
      { replace: true },
    );
  }, [isLoading, orders, stillPrePayment, active, navigate]);

  useEffect(() => {
    if (isError) navigate("/customer/orders", { replace: true });
  }, [isError, navigate]);

  if (isLoading) return <Loader />;
  if (orders.length === 0) return null;

  const isOnline = active.some((o) => o.payment?.method === "online");
  const canPay =
    isOnline &&
    active.length > 0 &&
    active.every((o) => o.status === "paymentPending");
  const decided = orders.filter((o) => o.status !== "pendingAcceptance").length;
  const payTotal = active.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-2 flex flex-col items-center gap-2 text-center">
          <FiCheckCircle className="text-4xl text-success" />
          <h1 className="text-2xl font-extrabold">Order Placed!</h1>
          <p className="text-sm text-muted">
            {orders.length > 1
              ? `Your order has been split into ${orders.length} orders, one per farm.`
              : "Here are your order details."}
          </p>
        </div>

        {orders.map((order) => (
          <OrderDetailContent
            key={order._id}
            order={order}
            onCancel={(orderId) => cancelMutation.mutate(orderId)}
            isCancelling={cancelMutation.isPending}
          />
        ))}

        {isOnline && active.length > 0 && (
          <div className="bg-base-100 rounded-box border border-theme-light p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total to pay</span>
              <span className="font-bold">৳{payTotal}</span>
            </div>

            {canPay ? (
              <button
                type="button"
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
                className="btn btn-primary w-full"
              >
                Pay ৳{payTotal} for all orders
              </button>
            ) : (
              <p className="text-xs text-muted-light">
                Payment opens once every farm has responded ({decided} of{" "}
                {orders.length} done).
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/customer/orders")}
          className="btn btn-ghost w-full"
        >
          Go to My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
