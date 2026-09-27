import { useMyOrders } from "../../hooks/useOrders";
import OrderCard from "../../components/OrderCard";
import { useMemo } from "react";

const PRE_PAYMENT = ["pendingAcceptance", "orderPlaced", "paymentPending"];

const CustomerOrders = () => {
  const { data: orders = [], isLoading } = useMyOrders();

  const pendingGroups = useMemo(
    () =>
      new Set(
        orders
          .filter((o) => PRE_PAYMENT.includes(o.status))
          .map((o) => o.orderGroup),
      ),
    [orders],
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl font-bold mb-4">My Orders</h1>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-box" />
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <p className="text-sm text-muted-light">
          You haven't placed any orders yet.
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              groupPending={pendingGroups.has(order.orderGroup)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
