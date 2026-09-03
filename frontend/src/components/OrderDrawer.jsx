const OrderDrawer = ({
  order,
  type = 1,
  onClose,
}) => {
  if (!order) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[430px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">
                {order.id}
              </h2>

              <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[9px]">
                Paid
              </span>
            </div>

            <p className="text-[10px] text-gray-400 mt-1">
              {type === 1
                ? "September 09, 2026"
                : "Freshmart order details"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {type === 1 ? (
            <DrawerOne order={order} />
          ) : (
            <DrawerTwo order={order} />
          )}
        </div>

        {/* Bottom */}
        {type === 1 && (
          <div className="border-t border-gray-100 p-4 flex gap-2">
            <button className="flex-1 border rounded-lg h-10 text-xs">
              Refund
            </button>

            <button className="flex-1 border rounded-lg h-10 text-xs">
              Invoice
            </button>

            <button className="flex-1 bg-purple-600 text-white rounded-lg h-10 text-xs">
              Update Status
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* =========================
   DRAWER ONE
========================= */

const DrawerOne = ({ order }) => {
  return (
    <>
      {/* Order Summary */}
      <Section title="Order Summary">
        <Row label="Order status">
          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
            Delivered
          </span>
        </Row>

        <Row
          label="Shipping Method"
          value="Freshmart Express"
        />

        <Row
          label="Tracking Number"
          value="FM-BD-20260901"
        />
      </Section>

      {/* Customer */}
      <Section title="Customer Info">
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs">
            {getInitials(order.customer)}
          </div>

          <div>
            <p className="text-xs font-medium">
              {order.customer}
            </p>

            <p className="text-[10px] text-gray-400">
              customer@freshmart.com
            </p>
          </div>
        </div>

        <Row
          label="Phone Number"
          value="+880 1700 123456"
        />

        <Row
          label="Shipping Address"
          value={order.location}
        />
      </Section>

      {/* Farmer */}
      <Section title="Farmer Info">
        <Row
          label="Farmer"
          value="Abdul Karim"
        />

        <Row
          label="Farm Location"
          value="Bogura, Bangladesh"
        />

        <Row
          label="Farm Type"
          value="Organic Vegetable Farm"
        />
      </Section>

      {/* Product */}
      <Section
        title="Items"
        action={
          <span className="text-purple-500 text-[10px]">
            Add Product ↗
          </span>
        }
      >
        <div className="border rounded-lg p-3 flex gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
            {order.icon || "🥬"}
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium">
              {order.product}
            </p>

            <p className="text-[10px] text-gray-400 mt-1">
              Fresh from local farmer
            </p>

            <p className="text-xs font-semibold mt-2">
              {order.total}
            </p>
          </div>

          <span className="text-[9px] text-gray-400">
            Qty: {order.quantity}
          </span>
        </div>
      </Section>

      {/* Payment */}
      <Section
        title="Payment"
        action={
          <span className="text-purple-500 text-[10px]">
            Download Invoice ↓
          </span>
        }
      >
        <Row
          label="Subtotal"
          value={order.total}
        />

        <Row
          label="Discount"
          value="৳0"
        />

        <Row
          label="Delivery Cost"
          value="৳60"
        />

        <Row
          label="Tax"
          value="৳10"
        />

        <div className="border-t mt-3 pt-3 flex justify-between">
          <b className="text-xs">
            Total
          </b>

          <b className="text-xs">
            ৳{calculateTotal(order.total)}
          </b>
        </div>
      </Section>

      {/* Timeline */}
      <Section title="Timeline">
        <Timeline
          title="Order Confirmed"
          text="Freshmart confirmed the customer order."
          active
        />

        <Timeline
          title="Farmer Confirmed"
          text="The farmer confirmed product availability."
        />

        <Timeline
          title="Order Placed"
          text="The customer successfully placed the order."
        />
      </Section>
    </>
  );
};

/* =========================
   DRAWER TWO
========================= */

const DrawerTwo = ({ order }) => {
  return (
    <>
      <Section title="Items">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
            {order.icon || "🥕"}
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium">
              {order.product}
            </p>

            <p className="text-[9px] text-gray-400">
              Fresh Farmer Product
            </p>
          </div>

          <b className="text-xs">
            {order.total}
          </b>
        </div>
      </Section>

      <Section title="Order Information">
        <Row
          label="Created at"
          value="September 09, 2026"
        />

        <Row
          label="Delivery Services"
          value="Freshmart Express"
        />

        <Row
          label="Payment method"
          value="bKash"
        />

        <Row
          label="Status"
          value="Processed"
        />
      </Section>

      <Section title="Farmer Information">
        <Row
          label="Farmer name"
          value="Abdul Karim"
        />

        <Row
          label="Farm location"
          value="Bogura, Bangladesh"
        />

        <Row
          label="Product source"
          value="Local Farm"
        />
      </Section>

      <Section title="Customer">
        <Row
          label="Customer name"
          value={order.customer}
        />

        <Row
          label="Email"
          value="customer@freshmart.com"
        />

        <Row
          label="Phone"
          value="+880 1700 123456"
        />
      </Section>

      <Section title="Timeline">
        <Timeline
          title="Order Processed"
          text="The order is being prepared by the farmer."
          active
        />

        <Timeline
          title="Payment Confirmed"
          text="Customer payment has been successfully verified."
        />

        <Timeline
          title="Order Placed"
          text="Order was successfully placed by the customer."
        />
      </Section>

      <Section title="Payment">
        <Row
          label="Subtotal"
          value={order.total}
        />

        <Row
          label="Discount"
          value="৳0"
        />

        <Row
          label="Delivery Cost"
          value="৳60"
        />

        <Row
          label="Tax"
          value="৳10"
        />

        <div className="border-t mt-3 pt-3 flex justify-between">
          <b className="text-xs">
            Total
          </b>

          <b className="text-xs">
            ৳{calculateTotal(order.total)}
          </b>
        </div>
      </Section>
    </>
  );
};

/* =========================
   SMALL COMPONENTS
========================= */

const Section = ({
  title,
  action,
  children,
}) => (
  <div className="p-5 border-b border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xs font-semibold">
        {title}
      </h3>

      {action}
    </div>

    {children}
  </div>
);

const Row = ({
  label,
  value,
  children,
}) => (
  <div className="flex justify-between gap-4 py-2">
    <span className="text-[10px] text-gray-400">
      {label}
    </span>

    {children || (
      <span className="text-[10px] text-gray-700 text-right">
        {value}
      </span>
    )}
  </div>
);

const Timeline = ({
  title,
  text,
  active,
}) => (
  <div className="flex gap-3 pb-5">
    <div
      className={`mt-1 w-3 h-3 rounded-full border-2 ${
        active
          ? "border-blue-500"
          : "border-gray-300"
      }`}
    />

    <div>
      <p className="text-[10px] font-medium">
        {title}
      </p>

      <p className="text-[9px] text-gray-400 mt-1">
        {text}
      </p>
    </div>
  </div>
);

/* =========================
   HELPERS
========================= */

const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const calculateTotal = (price) => {
  const number = Number(
    price.replace(/[^\d.]/g, "")
  );

  return (number + 60 + 10).toFixed(0);
};

export default OrderDrawer;