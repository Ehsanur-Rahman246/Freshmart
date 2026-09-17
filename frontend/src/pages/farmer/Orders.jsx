import { useState } from "react";
import { useFarmerOrders } from "../../hooks/useOrders";
import OrderList from "../../components/OrderList";
import OrderDrawer from "../../components/OrderDrawer";

const FarmerOrders = () => {
  const { data: orders = [], isLoading } = useFarmerOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="p-4 md:p-8">
      <OrderList orders={orders} isLoading={isLoading} onSelect={setSelectedOrder} />

      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default FarmerOrders;