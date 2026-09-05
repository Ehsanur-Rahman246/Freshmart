const orders = [
  {
    id: "#FM1928",
    product: "Fresh Tomato",
    customer: "Liam Carter",
    location: "Dhaka, Bangladesh",
    quantity: "3 kg",
    total: "৳210",
    status: "Delivered",
    icon: "🍅",
  },
  {
    id: "#FM1929",
    product: "Fresh Mango",
    customer: "Emma Brown",
    location: "Dhaka, Bangladesh",
    quantity: "5 kg",
    total: "৳800",
    status: "Delivered",
    icon: "🥭",
  },
  {
    id: "#FM1932",
    product: "Fresh Potato",
    customer: "Sofia Rahman",
    location: "Chattogram, Bangladesh",
    quantity: "10 kg",
    total: "৳550",
    status: "Pending",
    icon: "🥔",
  },
  {
    id: "#FM1934",
    product: "Fresh Spinach",
    customer: "Isabella Ahmed",
    location: "Sylhet, Bangladesh",
    quantity: "6 bundle",
    total: "৳270",
    status: "Processed",
    icon: "🥬",
  },
  {
    id: "#FM1943",
    product: "Fresh Carrot",
    customer: "Daniel Hasan",
    location: "Rajshahi, Bangladesh",
    quantity: "5 kg",
    total: "৳400",
    status: "Delivered",
    icon: "🥕",
  },
  {
    id: "#FM1931",
    product: "Fresh Cucumber",
    customer: "Lucas Islam",
    location: "Gazipur, Bangladesh",
    quantity: "6 kg",
    total: "৳390",
    status: "Processed",
    icon: "🥒",
  },
  {
    id: "#FM1939",
    product: "Red Onion",
    customer: "Ava Akter",
    location: "Dhaka, Bangladesh",
    quantity: "8 kg",
    total: "৳880",
    status: "Delivered",
    icon: "🧅",
  },
  {
    id: "#FM1942",
    product: "Green Chilli",
    customer: "Hannah Sultana",
    location: "Cumilla, Bangladesh",
    quantity: "2 kg",
    total: "৳180",
    status: "Completed",
    icon: "🌶️",
  },
];

const OrderList = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f4] p-4 md:p-6">
      

      {/* Main */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-sm">
                Order List
              </h2>

              <p className="text-[10px] text-gray-400 mt-1">
                Orders from Freshmart customers and farmers
              </p>
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Search Orders..."
                className="border border-gray-200 rounded-lg px-3 h-9 text-xs outline-none w-full md:w-52"
              />

              <button className="border border-gray-200 rounded-lg px-3 text-xs">
                Export CSV
              </button>

              <button className="border border-gray-200 rounded-lg px-3 text-xs">
                Saved Views
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-5 text-xs overflow-x-auto">
            <span className="font-medium border-b-2 border-gray-800 pb-3">
              All 40
            </span>

            <span className="text-gray-400 pb-3">
              Completed 31
            </span>

            <span className="text-gray-400 pb-3">
              Processed 4
            </span>

            <span className="text-gray-400 pb-3">
              Returned 2
            </span>

            <span className="text-gray-400 pb-3">
              Cancelled 2
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="bg-[#fafafa] text-[10px] text-gray-400">
                <th className="text-left p-4">
                  Order ID
                </th>

                <th className="text-left">
                  Product Name
                </th>

                <th className="text-left">
                  Customer Name
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Total
                </th>

                <th>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-4 text-xs font-medium">
                    {order.id}
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        {order.icon}
                      </div>

                      <div>
                        <p className="text-xs font-medium">
                          {order.product}
                        </p>

                        <p className="text-[9px] text-gray-400">
                          Freshmart Product
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      <p className="text-xs">
                        {order.customer}
                      </p>

                      <p className="text-[9px] text-gray-400">
                        {order.location}
                      </p>
                    </div>
                  </td>

                  <td className="text-xs">
                    {order.quantity}
                  </td>

                  <td className="text-xs font-medium">
                    {order.total}
                  </td>

                  <td>
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-[9px]">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;