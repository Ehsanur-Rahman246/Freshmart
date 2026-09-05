const orders = [
  {
    id: "#FM100981",
    date: "9 Sep 2026",
    status: "On Delivery",
    from: "Bogura Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Tomato",
    price: "৳70 / kg",
    size: "2 kg",
    icon: "🍅",
    items: 3,
  },
  {
    id: "#FM100982",
    date: "10 Sep 2026",
    status: "Deliver",
    from: "Rajshahi Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Mango",
    price: "৳160 / kg",
    size: "3 kg",
    icon: "🥭",
    items: 4,
  },
  {
    id: "#FM100983",
    date: "10 Sep 2026",
    status: "On The Way",
    from: "Rangpur Farm",
    to: "Gazipur, Bangladesh",
    product: "Fresh Potato",
    price: "৳55 / kg",
    size: "5 kg",
    icon: "🥔",
    items: 6,
  },
  {
    id: "#FM100984",
    date: "11 Sep 2026",
    status: "On Delivery",
    from: "Jessore Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Spinach",
    price: "৳45 / bundle",
    size: "4 bundle",
    icon: "🥬",
    items: 2,
  },
  {
    id: "#FM100985",
    date: "11 Sep 2026",
    status: "Deliver",
    from: "Mymensingh Farm",
    to: "Dhaka, Bangladesh",
    product: "Fresh Carrot",
    price: "৳80 / kg",
    size: "3 kg",
    icon: "🥕",
    items: 5,
  },
  {
    id: "#FM100986",
    date: "12 Sep 2026",
    status: "On The Way",
    from: "Cumilla Farm",
    to: "Chattogram, Bangladesh",
    product: "Fresh Cucumber",
    price: "৳65 / kg",
    size: "4 kg",
    icon: "🥒",
    items: 4,
  },
];

const OrderCards = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-8">
      

      {/* Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition"
          >
            {/* Order ID */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] text-gray-400">Order ID</p>

                <p className="text-sm font-semibold">{order.id}</p>
              </div>

              <div className="flex gap-1 text-[8px]">
                <span className="px-2 py-1 bg-gray-50 rounded">
                  Arrival {order.date}
                </span>

                <span className="px-2 py-1 bg-gray-50 rounded">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-3 text-[9px] text-gray-500">
              <span>⌖ {order.from}</span>

              <span className="flex-1 border-t border-dashed border-gray-300" />

              <span>⌖ {order.to}</span>
            </div>

            {/* Product */}
            <div className="bg-[#fafafa] rounded-lg p-2 mt-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                {order.icon}
              </div>

              <div>
                <p className="text-xs font-medium">
                  {order.product}
                </p>

                <p className="text-[9px] text-gray-500">
                  {order.price}
                </p>

                <p className="text-[9px] text-gray-400">
                  Quantity: {order.size}
                </p>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-[10px]">
                {order.items} Items
              </span>

              <button
                onClick={() => onSelect(order)}
                className="px-5 py-1.5 bg-white border border-gray-100 rounded-md text-[10px] hover:bg-gray-50"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCards;