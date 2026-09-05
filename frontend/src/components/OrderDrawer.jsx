const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const Section = ({ title, children }) => {
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <p className="text-[10px] font-semibold mb-3">
        {title}
      </p>

      {children}
    </div>
  );
};

const Row = ({ label, value }) => {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-[10px]">
      <span className="text-gray-400">
        {label}
      </span>

      <span className="text-right font-medium">
        {value}
      </span>
    </div>
  );
};

const Timeline = ({ status }) => {
  return (
    <div className="space-y-4">

      <div className="flex gap-3">
        <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />

        <div>
          <p className="text-[10px] font-medium">
            Order Placed
          </p>

          <p className="text-[9px] text-gray-400">
            Order has been placed successfully
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />

        <div>
          <p className="text-[10px] font-medium">
            Processing
          </p>

          <p className="text-[9px] text-gray-400">
            Farmer is preparing your products
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />

        <div>
          <p className="text-[10px] font-medium">
            {status || "On The Way"}
          </p>

          <p className="text-[9px] text-gray-400">
            Your order is on its way
          </p>
        </div>
      </div>

    </div>
  );
};

const DrawerOne = ({ order }) => {
  const customer =
    order.customer || "Freshmart Customer";

  const location =
    order.location || order.to || "Dhaka, Bangladesh";

  const quantity =
    order.quantity || "2 kg";

  const total =
    order.total || "৳210";

  return (
    <div className="space-y-3">

      {/* Order Info */}
      <Section title="Order Information">

        <Row
          label="Order ID"
          value={order.id}
        />

        <Row
          label="Status"
          value={order.status}
        />

        <Row
          label="Date"
          value={order.date || "9 Sep 2026"}
        />

      </Section>

      {/* Product */}
      <Section title="Product">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
            {order.icon || "🥬"}
          </div>

          <div>
            <p className="text-xs font-medium">
              {order.product}
            </p>

            <p className="text-[9px] text-gray-400">
              {quantity}
            </p>

            <p className="text-[9px] text-gray-500">
              {order.price || total}
            </p>
          </div>

        </div>

      </Section>

      {/* Customer */}
      <Section title="Customer">

        <div className="flex items-center gap-3 mb-2">

          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold">
            {getInitials(customer)}
          </div>

          <div>
            <p className="text-xs font-medium">
              {customer}
            </p>

            <p className="text-[9px] text-gray-400">
              Customer
            </p>
          </div>

        </div>

        <Row
          label="Location"
          value={location}
        />

      </Section>

      {/* Delivery */}
      <Section title="Delivery">

        <Row
          label="From"
          value={order.from || "Bogura Farm"}
        />

        <Row
          label="To"
          value={order.to || location}
        />

        <Row
          label="Quantity"
          value={quantity}
        />

      </Section>

      {/* Payment */}
      <Section title="Payment">

        <Row
          label="Product Total"
          value={total}
        />

        <Row
          label="Delivery Fee"
          value="৳60"
        />

        <div className="border-t border-gray-100 mt-2 pt-2">
          <Row
            label="Total"
            value={total}
          />
        </div>

      </Section>

      {/* Timeline */}
      <Section title="Order Timeline">
        <Timeline status={order.status} />
      </Section>

    </div>
  );
};

const DrawerTwo = ({ order }) => {
  const customer =
    order.customer || "Freshmart Customer";

  const location =
    order.location || order.to || "Dhaka, Bangladesh";

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="bg-[#fafafa] rounded-xl p-4">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl">
            {order.icon || "🥬"}
          </div>

          <div>
            <p className="text-[9px] text-gray-400">
              Order
            </p>

            <p className="text-sm font-semibold">
              {order.id}
            </p>

            <p className="text-[9px] text-gray-500">
              {order.status}
            </p>
          </div>

        </div>

      </div>

      {/* Customer */}
      <Section title="Customer Details">

        <Row
          label="Name"
          value={customer}
        />

        <Row
          label="Location"
          value={location}
        />

      </Section>

      {/* Product */}
      <Section title="Order Details">

        <Row
          label="Product"
          value={order.product}
        />

        <Row
          label="Quantity"
          value={order.quantity || order.size}
        />

        <Row
          label="Price"
          value={order.price || order.total}
        />

        <Row
          label="Status"
          value={order.status}
        />

      </Section>

      {/* Delivery */}
      <Section title="Delivery Information">

        <Row
          label="Farm"
          value={order.from || "Freshmart Farm"}
        />

        <Row
          label="Destination"
          value={order.to || location}
        />

        <Row
          label="Arrival"
          value={order.date || "9 Sep 2026"}
        />

      </Section>

      {/* Timeline */}
      <Section title="Tracking">

        <Timeline status={order.status} />

      </Section>

      {/* Action */}
      <button className="w-full bg-black text-white rounded-lg py-2.5 text-xs hover:bg-gray-800">
        Contact Support
      </button>

    </div>
  );
};

const OrderDrawer = ({ order, type = 1, onClose }) => {
  if (!order) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />

      {/* Drawer */}
      <div
        className="
          fixed
          z-50
          bg-white
          shadow-2xl
          bottom-0
          left-0
          right-0
          h-[85vh]
          rounded-t-2xl
          flex
          flex-col
          sm:top-0
          sm:right-0
          sm:left-auto
          sm:bottom-auto
          sm:h-screen
          sm:w-[430px]
          sm:rounded-none
        "
      >

        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">

          <div>
            <p className="text-[9px] text-gray-400">
              Order Details
            </p>

            <h2 className="text-sm font-semibold">
              {order.id}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
          >
            ✕
          </button>

        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {type === 1 ? (
            <DrawerOne order={order} />
          ) : (
            <DrawerTwo order={order} />
          )}

        </div>

      </div>
    </>
  );
};

export default OrderDrawer;