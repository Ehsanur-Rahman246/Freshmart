import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiTruck, FiMapPin, FiX, FiPhone } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  getOrdersAwaitingAssignment,
  getAvailableDriversForOrder,
  assignDriverToOrder,
} from "../../api/delivery";
import Loader from "../../components/Loader";

const AssignDriverPanel = ({ order, onClose }) => {
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["delivery", "availableDrivers", order._id],
    queryFn: async () =>
      (await getAvailableDriversForOrder(order._id)).data.drivers,
  });

  const assignMutation = useMutation({
    mutationFn: (driverId) => assignDriverToOrder(order._id, driverId),
    onSuccess: () => {
      toast.success("Driver assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["delivery", "awaitingAssignment"],
      });
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not assign driver");
    },
  });

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-overlay z-40" />

      <div
        className="
          fixed z-50 bg-base-100 shadow-2xl
          bottom-0 left-0 right-0 h-[80vh] rounded-t-box
          flex flex-col
          sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto
          sm:h-screen sm:w-107.5 sm:rounded-none
        "
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-light">
          <div>
            <p className="text-xs text-muted-light">Assign Driver</p>
            <h2 className="text-sm font-bold">{order.orderNumber}</h2>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="border border-theme-light rounded-box p-4">
            <div className="flex items-center gap-2 text-sm text-muted mb-2">
              <FiMapPin className="shrink-0" />
              <span>
                {order.delivery?.originZone?.label || "Origin"} →{" "}
                {order.delivery?.destinationZone?.label || "Destination"}
              </span>
            </div>
            <p className="text-xs text-muted-light">
              {order.farm?.name} · {order.customer?.user?.name}
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}

          {!isLoading && drivers.length === 0 && (
            <p className="text-sm text-muted-light text-center py-8">
              No available drivers for this route right now.
            </p>
          )}

          {!isLoading &&
            drivers.map((driver) => (
              <div
                key={driver._id}
                className="border border-theme-light rounded-box p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{driver.name}</p>
                  <p className="text-xs text-muted-light flex items-center gap-1 mt-0.5">
                    <FiPhone size={11} /> {driver.phone}
                  </p>
                  <p className="text-xs text-muted-light mt-0.5">
                    {driver.courier?.name} ({driver.courier?.courierCode})
                  </p>
                </div>
                <button
                  onClick={() => assignMutation.mutate(driver._id)}
                  disabled={assignMutation.isPending}
                  className="btn btn-sm bg-primary text-primary-content shrink-0"
                >
                  Assign
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

const AdminDelivery = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["delivery", "awaitingAssignment"],
    queryFn: async () =>
      (await getOrdersAwaitingAssignment()).data.orders,
    staleTime: 1000 * 15,
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Delivery</h1>
        <p className="text-sm text-muted-light mt-1">
          Orders ready for pickup, awaiting a driver
        </p>
      </div>

      <div className="bg-base-100 rounded-box border border-theme-light overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-light">
            No orders currently awaiting driver assignment.
          </p>
        ) : (
          orders.map((order) => (
            <button
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-theme-light last:border-b-0 hover:bg-base-200 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-field bg-primary-soft flex items-center justify-center shrink-0">
                <FiTruck className="text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{order.orderNumber}</p>
                <p className="text-xs text-muted-light truncate">
                  {order.farm?.name} → {order.customer?.user?.name}
                </p>
              </div>

              <span className="badge badge-sm bg-warning-soft text-warning border-none shrink-0">
                Awaiting Driver
              </span>
            </button>
          ))
        )}
      </div>

      {selectedOrder && (
        <AssignDriverPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminDelivery;