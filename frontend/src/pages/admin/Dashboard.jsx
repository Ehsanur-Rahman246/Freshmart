import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import { getAllOrders as getAllOrdersFromOrderApi } from "../../api/order";
import { getStatusMeta } from "../../utils/orderStatus";
import Loader from "../../components/Loader";
import AdminAnalytics from "./Analytics";

const RECENT_ORDERS_COUNT = 5;

const RecentOrderRow = ({ order, onClick }) => {
  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length || 1) - 1;
  const image = firstItem?.product?.images?.[0]?.url;
  const statusMeta = getStatusMeta(order.status);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-theme-light last:border-b-0 hover:bg-base-200 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-field bg-base-200 flex items-center justify-center overflow-hidden shrink-0">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <FiPackage className="text-muted-light" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{order.orderNumber}</p>
        <p className="text-xs text-muted-light truncate">
          {firstItem?.name}
          {extraCount > 0 ? ` and ${extraCount} more` : ""}
        </p>
      </div>

      <span className={`badge ${statusMeta.badge} badge-sm shrink-0`}>
        {statusMeta.label}
      </span>

      <FiChevronRight className="text-muted-light shrink-0" />
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", "admin", "all"],
    queryFn: async () => (await getAllOrdersFromOrderApi()).data.orders,
    staleTime: 1000 * 30,
  });

  if (ordersLoading) {
    return <Loader />;
  }

  const recentOrders = orders.slice(0, RECENT_ORDERS_COUNT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-muted-light mt-1">
          Overview of your platform
        </p>
      </div>

      <AdminAnalytics/>

      <div className="bg-base-100 rounded-box border border-theme-light overflow-hidden">
        <div className="p-4 border-b border-theme-light flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm">Recent Orders</h2>
            <p className="text-xs text-muted-light mt-1">
              Latest orders placed on the platform
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="btn btn-sm btn-outline"
          >
            View All
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-light">
            No orders yet.
          </p>
        ) : (
          recentOrders.map((order) => (
            <RecentOrderRow
              key={order._id}
              order={order}
              onClick={() => navigate("/admin/orders")}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;