const OrderCard = ({ order, onSelect }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition">

      {/* Top */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] text-gray-400">
            Order ID
          </p>

          <p className="text-sm font-semibold">
            {order.id}
          </p>
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
            Quantity: {order.quantity}
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
  );
};

export default OrderCard;