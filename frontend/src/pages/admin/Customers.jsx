import { useQuery } from "@tanstack/react-query";
import { FiUser, FiMapPin } from "react-icons/fi";
import { getAllCustomers } from "../../api/admin";
import { getAllOrders } from "../../api/order";
import { getAllReviewsAdmin } from "../../api/review";
import Loader from "../../components/Loader";

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const AdminCustomers = () => {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => (await getAllCustomers()).data.customers,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", "admin", "all"],
    queryFn: async () => (await getAllOrders()).data.orders,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", "admin"],
    queryFn: async () => (await getAllReviewsAdmin()).data.reviews,
  });

  if (customersLoading || ordersLoading || reviewsLoading) {
    return <Loader />;
  }

  const ordersCountByCustomer = new Map();
  for (const order of orders) {
    const id = order.customer?._id;
    if (!id) continue;
    ordersCountByCustomer.set(id, (ordersCountByCustomer.get(id) || 0) + 1);
  }

  const reviewsCountByCustomer = new Map();
  for (const review of reviews) {
    const id = review.customer?._id;
    if (!id) continue;
    reviewsCountByCustomer.set(id, (reviewsCountByCustomer.get(id) || 0) + 1);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Customers</h1>
        <p className="text-sm text-muted-light mt-1">
          All registered customers on the platform
        </p>
      </div>

      <div className="bg-base-100 rounded-box border border-theme-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 table-fixed">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[30%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
            </colgroup>

            <thead>
              <tr className="bg-base-200 text-xs text-muted-light">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left font-medium">Default Address</th>
                <th className="text-center font-medium">Status</th>
                <th className="text-center font-medium">Orders</th>
                <th className="text-center font-medium">Reviews</th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-muted-light">
                    No customers yet.
                  </td>
                </tr>
              )}

              {customers.map((customer) => {
                const defaultAddress =
                  customer.addresses?.find((a) => a.isDefault) ||
                  customer.addresses?.[0];

                const addressText = defaultAddress
                  ? `${defaultAddress.upazila}, ${defaultAddress.district}`
                  : "—";

                return (
                  <tr key={customer._id} className="border-t border-theme-light">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                          {customer.profileImage?.url ? (
                            <img
                              src={customer.profileImage.url}
                              alt={customer.user?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(customer.user?.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {customer.user?.name}
                          </p>
                          <p className="text-xs text-muted-light truncate">
                            {customer.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-sm">
                        <FiMapPin className="shrink-0 text-muted-light" size={13} />
                        <span className="truncate">{addressText}</span>
                      </div>
                    </td>

                    <td className="text-center">
                      <span
                        className={`badge badge-sm border-none ${
                          customer.user?.isActive
                            ? "bg-success-soft text-success"
                            : "bg-error-soft text-error"
                        }`}
                      >
                        {customer.user?.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="text-sm text-center">
                      {ordersCountByCustomer.get(customer._id) || 0}
                    </td>

                    <td className="text-sm text-center">
                      {reviewsCountByCustomer.get(customer._id) || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;