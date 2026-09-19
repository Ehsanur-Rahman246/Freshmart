import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "../../api/order";
import OrderList from "../../components/OrderList";
import OrderDrawer from "../../components/OrderDrawer";

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", "admin", "all"],
    queryFn: async () => (await getAllOrders()).data.orders,
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Orders</h1>
        <p className="text-sm text-muted-light mt-1">
          All orders placed across the platform
        </p>
      </div>

      <OrderList
        orders={orders}
        isLoading={isLoading}
        onSelect={setSelectedOrder}
      />

      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default AdminOrders;