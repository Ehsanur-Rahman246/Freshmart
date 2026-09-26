import {
  FiPlus,
  FiStar,
  FiChevronRight,
  FiMessageSquare,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PiFarm } from "react-icons/pi";
import { getFarmerProfile } from "../../api/farmer";
import { getFarmerReviews } from "../../api/review";
import { useFarmerOrders } from "../../hooks/useOrders";
import { getStatusMeta } from "../../utils/orderStatus";
import { FaChartBar } from "react-icons/fa";
import { getPriceLedger } from "../../api/pricing";
import { getCategoryIcon } from "../../utils/categoryIcons";

export default function FarmerDashboard() {
  const navigate = useNavigate();

  const { data: farmer } = useQuery({
    queryKey: ["farmerProfile"],
    queryFn: async () => (await getFarmerProfile()).data.farmer,
  });

  const { data: orders = [], isLoading: ordersLoading } = useFarmerOrders();
  const recentOrders = orders.slice(0, 3);

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "farmer"],
    queryFn: async () => (await getFarmerReviews()).data.reviews,
  });
  const recentReviews = reviews.slice(0, 3);

  const { data: priceLedger = [] } = useQuery({
    queryKey: ["priceLedger"],
    queryFn: async () => (await getPriceLedger()).data.entries,
  });
  const recentPriceChanges = priceLedger
    .filter((entry) => entry.reason === "adminRangeClamp")
    .slice(0, 4);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : null;

  const farmName = farmer?.farms?.[0]?.name || "Your Farm";
  const farmLocation = farmer?.farms?.[0]?.location
    ? `${farmer.farms[0].location.upazila}, ${farmer.farms[0].location.district}`
    : "";

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl grid grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Hero Left */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-light">
            Today's baseline · Updated 6:00 AM
          </div>
          <h2 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Priced by demand.
            <br />
            Picked by you.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            {farmName}
            {farmLocation && ` · ${farmLocation}`}. Baseline prices move with
            stock and orders across FreshMart.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/farmer/listings")}
              className="btn border-0 bg-primary text-primary-content hover:bg-primary-hover"
            >
              <FiPlus size={17} />
              List a product
            </button>
            <button
              type="button"
              onClick={() => navigate("/farmer/pricing-history")}
              className="btn btn-ghost text-base-content hover:bg-primary-soft"
            >
              View full price sheet
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Price Ledger */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Recent price changes</h2>
          </div>

          {recentPriceChanges.length === 0 ? (
            <p className="text-sm text-muted">No price changes yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-box border border-theme bg-base-200">
              <table className="table">
                <thead>
                  <tr className="text-xs text-muted-light">
                    <th></th>
                    <th>Product</th>
                    <th>Unit</th>
                    <th>Price Change</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-light">
                  {recentPriceChanges.map((entry) => {
                    const Icon = getCategoryIcon(entry.product?.category);
                    const increased = entry.newPrice > entry.oldPrice;

                    return (
                      <tr key={entry._id}>
                        <td className="w-12">
                          <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center">
                            <Icon className="text-primary" size={16} />
                          </div>
                        </td>
                        <td className="font-semibold truncate max-w-55">
                          {entry.product?.name}
                        </td>
                        <td className="text-muted-light">
                          {entry.product?.unit || "-"}
                        </td>
                        <td className="text-muted-light whitespace-nowrap">
                          ৳{entry.oldPrice} → ৳{entry.newPrice}
                        </td>
                        <td className="w-10">
                          {increased ? (
                            <FiTrendingUp className="text-success" size={16} />
                          ) : (
                            <FiTrendingDown className="text-error" size={16} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold">Run the farm</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FiPlus,
              text: "List a product",
              sub: "Add stock, set your baseline-linked price",
              action: () => navigate("/farmer/listings"),
            },
            {
              icon: FaChartBar,
              text: "Your Sales",
              sub: "View your sales & revenue balance",
              action: () => navigate("/farmer/revenue"),
            },
            {
              icon: PiFarm,
              text: "Manage Your Farms",
              sub: "View your farms, manage it accrodingly",
              action: () => navigate("/farmer/farms"),
            },
            {
              icon: FiMessageSquare,
              text: "Contact & Help",
              sub: "Communicate with admin & customers. Get announcements",
              action: () => navigate("/farmer/messages"),
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={item.action}
              className="group rounded-box border border-theme bg-base-200 p-5 text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-md"
            >
              {item.icon && (
                <item.icon
                  size={21}
                  className="text-primary transition group-hover:scale-110"
                />
              )}
              <div className="mt-4 text-base font-bold">{item.text}</div>
              <div className="mt-1 text-sm text-muted-light">{item.sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">Recent orders</h2>
          <button
            type="button"
            onClick={() => navigate("/farmer/orders")}
            className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover"
          >
            View all <FiChevronRight size={15} />
          </button>
        </div>

        <div className="overflow-hidden rounded-box border border-theme bg-base-200">
          <div className="hidden grid-cols-[1fr_1.2fr_1.6fr_1fr] gap-4 border-b border-theme bg-base-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-light md:grid">
            <span>Order</span>
            <span>Customer</span>
            <span>Item</span>
            <span className="text-right">Status</span>
          </div>

          {ordersLoading && (
            <div className="px-5 py-8 text-center text-sm text-muted">
              Loading orders...
            </div>
          )}

          {!ordersLoading && recentOrders.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted">
              No orders yet.
            </div>
          )}

          {recentOrders.map((order) => {
            const statusMeta = getStatusMeta(order.status);
            const firstItem = order.items?.[0];
            const extraCount = (order.items?.length || 1) - 1;

            return (
              <div
                key={order._id}
                onClick={() => navigate("/farmer/orders")}
                className="grid cursor-pointer grid-cols-1 gap-2 border-b border-theme-light px-5 py-4 last:border-b-0 hover:bg-base-300/50 md:grid-cols-[1fr_1.2fr_1.6fr_1fr] md:items-center md:gap-4"
              >
                <span className="text-xs font-bold text-muted">
                  {order.orderNumber}
                </span>
                <span className="text-sm">{order.customer?.user?.name}</span>
                <span className="text-sm">
                  {firstItem?.name}
                  {extraCount > 0 && ` +${extraCount} more`}
                </span>
                <span className={`badge ${statusMeta.badge} w-fit md:ml-auto`}>
                  {statusMeta.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">What customers are saying</h2>
          <div className="flex items-center gap-3">
            {avgRating && (
              <span className="flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">
                <FiStar size={14} /> {avgRating} aggregate
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate("/farmer/reviews")}
              className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover"
            >
              View all <FiChevronRight size={15} />
            </button>
          </div>
        </div>

        {recentReviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recentReviews.map((review) => (
              <div
                key={review._id}
                onClick={() => navigate("/farmer/reviews")}
                className="cursor-pointer rounded-box border border-theme bg-base-200 p-5 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-3 flex gap-1 text-secondary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      size={14}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="text-sm italic leading-6 text-muted">
                  "{review.comment || "No comment left."}"
                </p>
                <div className="mt-4 text-xs font-bold text-muted-light">
                  — {review.customer?.user?.name || "Customer"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
