import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllFarmers, toggleUserStatus } from "../../api/admin";
import { getAllOrders } from "../../api/order";
import { getAllReviewsAdmin } from "../../api/review";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AdminFarmers = () => {
  const { data: farmers = [], isLoading: farmersLoading } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: async () => (await getAllFarmers()).data.farmers,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", "admin", "all"],
    queryFn: async () => (await getAllOrders()).data.orders,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", "admin"],
    queryFn: async () => (await getAllReviewsAdmin()).data.reviews,
  });

  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (userId) => toggleUserStatus(userId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "farmers"] });
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not update status"),
  });

  if (farmersLoading || ordersLoading || reviewsLoading) {
    return <Loader />;
  }

  const ordersCountByFarmer = new Map();
  for (const order of orders) {
    const id = order.farmer?._id;
    if (!id) continue;
    ordersCountByFarmer.set(id, (ordersCountByFarmer.get(id) || 0) + 1);
  }

  // Approximation: counts farm-reviews only (product-reviews aren't
  // attributable to a farmer from this endpoint's populate shape).
  const reviewsCountByFarmId = new Map();
  for (const review of reviews) {
    const farmId = review.farm?._id;
    if (!farmId) continue;
    reviewsCountByFarmId.set(
      farmId,
      (reviewsCountByFarmId.get(farmId) || 0) + 1,
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Farmers</h1>
        <p className="text-sm text-muted-light mt-1">
          All registered farmers on the platform
        </p>
      </div>

      <div className="bg-base-100 rounded-box border border-theme-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 table-fixed">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead>
              <tr className="bg-base-200 text-xs text-muted-light">
                <th className="text-left p-4 font-medium">Farmer</th>
                <th className="text-left font-medium">Farms</th>
                <th className="text-center font-medium">Status</th>
                <th className="text-center font-medium">Orders</th>
                <th className="text-center font-medium">Reviews</th>
                <th className="text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {farmers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-sm text-muted-light"
                  >
                    No farmers yet.
                  </td>
                </tr>
              )}

              {farmers.map((farmer) => {
                const reviewsCount = (farmer.farms || []).reduce(
                  (sum, farm) =>
                    sum + (reviewsCountByFarmId.get(farm._id) || 0),
                  0,
                );

                return (
                  <tr key={farmer._id} className="border-t border-theme-light">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                          {farmer.profileImage?.url ? (
                            <img
                              src={farmer.profileImage.url}
                              alt={farmer.user?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(farmer.user?.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {farmer.user?.name}
                          </p>
                          <p className="text-xs text-muted-light truncate">
                            {farmer.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-sm">{farmer.farms?.length || 0}</td>

                    <td className="text-center">
                      <span
                        className={`badge badge-sm border-none ${
                          farmer.user?.isActive
                            ? "bg-success-soft text-success"
                            : "bg-error-soft text-error"
                        }`}
                      >
                        {farmer.user?.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="text-sm text-center">
                      {ordersCountByFarmer.get(farmer._id) || 0}
                    </td>

                    <td className="text-sm text-center">{reviewsCount}</td>

                    <td className="text-center">
                      <button
                        onClick={() =>
                          toggleMutation.mutate(farmer.user?._id)
                        }
                        disabled={toggleMutation.isPending}
                        className={`btn btn-xs ${
                          farmer.user?.isActive
                            ? "btn-outline text-error"
                            : "bg-primary text-primary-content"
                        }`}
                      >
                        {farmer.user?.isActive ? "Disable" : "Enable"}
                      </button>
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

export default AdminFarmers;
