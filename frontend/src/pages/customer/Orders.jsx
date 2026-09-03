import { useState } from "react";
import OrderCards from "../../components/OrderCards";
import OrderList from "../../components/OrderList";
import OrderDrawer from "../../components/OrderDrawer";

const Orders = () => {
  const [view, setView] = useState("cards");
  const [selectedOrder, setSelectedOrder] =
    useState(null);
  const [drawerType, setDrawerType] = useState(1);

  const openDrawer = (order, type = 1) => {
    setSelectedOrder(order);
    setDrawerType(type);
  };

  const closeDrawer = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="relative">
      {/* Page Switcher */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-white shadow-lg border rounded-full p-1 flex gap-1">
        <button
          onClick={() => {
            setView("cards");
            closeDrawer();
          }}
          className={`px-4 py-2 rounded-full text-xs ${
            view === "cards"
              ? "bg-black text-white"
              : "text-gray-500"
          }`}
        >
          Page 1
        </button>

        <button
          onClick={() => {
            setView("list");
            closeDrawer();
          }}
          className={`px-4 py-2 rounded-full text-xs ${
            view === "list"
              ? "bg-black text-white"
              : "text-gray-500"
          }`}
        >
          Page 2
        </button>

        <button
          onClick={() => {
            setView("details");
            closeDrawer();
          }}
          className={`px-4 py-2 rounded-full text-xs ${
            view === "details"
              ? "bg-black text-white"
              : "text-gray-500"
          }`}
        >
          Page 3
        </button>
      </div>

      {/* PAGE 1 */}
      {view === "cards" && (
        <OrderCards
          onSelect={(order) =>
            openDrawer(order, 1)
          }
        />
      )}

      {/* PAGE 2 */}
      {view === "list" && (
        <OrderList
          onSelect={(order) =>
            openDrawer(order, 1)
          }
        />
      )}

      {/* PAGE 3 */}
      {view === "details" && (
        <OrderList
          onSelect={(order) =>
            openDrawer(order, 2)
          }
        />
      )}

      {/* Drawer */}
      <OrderDrawer
        order={selectedOrder}
        type={drawerType}
        onClose={closeDrawer}
      />
    </div>
  );
};

export default Orders;