import { FiPackage } from "react-icons/fi";
import { getStatusMeta } from "../utils/orderStatus";
import { useMemo, useState } from "react";
import { useViewer } from "../hooks/useViewer";

const ONGOING_STATUSES = [
  "pendingAcceptance",
  "paymentPending",
  "orderPlaced",
  "processing",
  "readyForPickup",
  "pickedUp",
  "toOriginCenter",
  "inTransit",
  "toDestinationCenter",
  "outForDelivery",
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ongoing", label: "Ongoing" },
  { key: "delivered", label: "Delivered" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const matchesFilter = (status, filter) => {
  if (filter === "all") return true;
  if (filter === "ongoing") return ONGOING_STATUSES.includes(status);
  return status === filter;
};

const OrderList = ({ orders = [], isLoading, onSelect }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { role } = useViewer();
  const isFarmer = role == "farmer";

  const counts = useMemo(() => {
    const result = {
      all: orders.length,
      ongoing: 0,
      delivered: 0,
      rejected: 0,
      cancelled: 0,
    };
    for (const order of orders) {
      if (ONGOING_STATUSES.includes(order.status)) result.ongoing++;
      else if (result[order.status] !== undefined) result[order.status]++;
    }
    return result;
  }, [orders]);

  const filteredOrders = useMemo(
    () => orders.filter((o) => matchesFilter(o.status, activeFilter)),
    [orders, activeFilter],
  );

  return (
    <div className="bg-base-100 rounded-box border border-theme-light overflow-hidden">
      {isFarmer && (
        <div className="p-4 border-b border-theme-light">
          <h2 className="font-bold text-sm">Orders</h2>
          <p className="text-xs text-muted-light mt-1">
            Orders placed by customers for your farms
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-theme-light">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`badge gap-1 cursor-pointer ${
              activeFilter === f.key ? "badge-primary" : "badge-ghost"
            }`}
          >
            {f.label}
            <span className="opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-225 table-fixed">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[28%]" />
            <col className="w-[22%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
          </colgroup>

          <thead>
            <tr className="bg-base-200 text-xs text-muted-light">
              <th className="text-left p-4 font-medium">Order</th>
              <th className="text-left font-medium">Product</th>
              <th className="text-left font-medium">Customer</th>
              <th className="text-center font-medium">Items</th>
              <th className="text-center font-medium">Total</th>
              <th className="text-center font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-theme-light">
                  <td className="p-4" colSpan={6}>
                    <div className="skeleton h-6 rounded-field" />
                  </td>
                </tr>
              ))}

            {!isLoading && filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-sm text-muted-light"
                >
                  No {activeFilter === "all" ? "" : activeFilter} orders
                  {activeFilter === "all" ? " yet" : ""}.
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredOrders.map((order) => {
                const firstItem = order.items?.[0];
                const extraCount = (order.items?.length || 1) - 1;
                const image = firstItem?.product?.images?.[0]?.url;
                const statusMeta = getStatusMeta(order.status);

                return (
                  <tr
                    key={order._id}
                    onClick={() => onSelect(order)}
                    className="border-t border-theme-light hover:bg-base-200 cursor-pointer"
                  >
                    <td className="p-4 text-sm font-semibold">
                      {order.orderNumber}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 shrink-0 bg-base-200 rounded-field flex items-center justify-center overflow-hidden">
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiPackage className="text-muted-light" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {firstItem?.name}
                          </p>
                          {extraCount > 0 && (
                            <p className="text-xs text-muted-light">
                              and {extraCount} more
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <p className="text-sm">{order.customer?.user?.name}</p>
                        <p className="text-xs text-muted-light">
                          {order.deliveryAddress?.district}
                        </p>
                      </div>
                    </td>

                    <td className="text-sm text-center">
                      {order.items?.length}
                    </td>

                    <td className="text-sm font-medium text-center">
                      ৳{order.pricing?.total}
                    </td>

                    <td className="text-center">
                      <span className={`badge ${statusMeta.badge} badge-sm`}>
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
