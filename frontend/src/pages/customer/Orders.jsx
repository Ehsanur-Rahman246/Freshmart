import { useState } from "react";
import OrderCard from "../../components/OrderCard";
import OrderList from "../../components/OrderList";
import OrderDrawer from "../../components/OrderDrawer";

const orders = [
  {
    id: "#FM100981",
    date: "9 Sep 2026",
    status: "On Delivery",
    from: "Bogura Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Tomato",
    price: "৳70 / kg",
    quantity: "2 kg",
    items: 3,
    total: "৳140",
    icon: "🍅",
  },
  {
    id: "#FM100982",
    date: "10 Sep 2026",
    status: "Deliver",
    from: "Rajshahi Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Mango",
    price: "৳160 / kg",
    quantity: "3 kg",
    items: 4,
    total: "৳480",
    icon: "🥭",
  },
  {
    id: "#FM100983",
    date: "10 Sep 2026",
    status: "On The Way",
    from: "Rangpur Farm",
    to: "Gazipur, Bangladesh",
    product: "Fresh Potato",
    price: "৳55 / kg",
    quantity: "5 kg",
    items: 6,
    total: "৳275",
    icon: "🥔",
  },
  {
    id: "#FM100984",
    date: "11 Sep 2026",
    status: "On Delivery",
    from: "Jessore Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Spinach",
    price: "৳45 / bundle",
    quantity: "4 bundle",
    items: 2,
    total: "৳180",
    icon: "🥬",
  },
  {
    id: "#FM100985",
    date: "11 Sep 2026",
    status: "Deliver",
    from: "Mymensingh Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Carrot",
    price: "৳80 / kg",
    quantity: "3 kg",
    items: 5,
    total: "৳240",
    icon: "🥕",
  },
  {
    id: "#FM100986",
    date: "12 Sep 2026",
    status: "On The Way",
    from: "Cumilla Farm",
    to: "Chattogram, Bangladesh",
    product: "Fresh Cucumber",
    price: "৳65 / kg",
    quantity: "4 kg",
    items: 4,
    total: "৳260",
    icon: "🥒",
  },
];

const Orders = () => {
  const [view, setView] = useState("cards");
  const [selectedOrder, setSelectedOrder] = useState(null);
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

      {/* Page 1 - Cards */}
      {view === "cards" && (
        <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={openDrawer}
              />
            ))}

          </div>

        </div>
      )}

      {/* Page 2 - List */}
      {view === "list" && (
        <OrderList
          onSelect={(order) => openDrawer(order, 1)}
        />
      )}

      {/* Page 3 - Details */}
      {view === "details" && (
        <OrderList
          onSelect={(order) => openDrawer(order, 2)}
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