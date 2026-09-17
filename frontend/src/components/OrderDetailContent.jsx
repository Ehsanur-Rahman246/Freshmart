import {
  FiUser,
  FiTruck,
  FiCreditCard,
  FiPackage,
  FiClock,
} from "react-icons/fi";
import {
  getStatusMeta,
  getActiveStepIndex,
  isTerminalFailure,
  DELIVERY_STEP_GROUPS,
} from "../utils/orderStatus";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Section = ({ title, icon, children }) => (
  <div className="border border-theme-light rounded-box p-4">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <p className="text-sm font-bold">{title}</p>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <span className="text-muted-light">{label}</span>
    <span className="text-right font-medium">{value ?? "—"}</span>
  </div>
);

const DeliveryTimeline = ({ status }) => {
  if (isTerminalFailure(status)) {
    const meta = getStatusMeta(status);
    return (
      <div
        className={`alert ${
          status === "cancelled" ? "alert-error" : "alert-warning"
        }`}
      >
        <span>This order was {meta.label.toLowerCase()}.</span>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(status);

  return (
    <ul className="timeline timeline-vertical timeline-compact">
      {DELIVERY_STEP_GROUPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <li key={step.key}>
            {index > 0 && (
              <hr className={isDone || isCurrent ? "bg-primary" : ""} />
            )}

            <div className="timeline-middle">
              <div
                className={`w-3 h-3 rounded-full ${
                  isDone || isCurrent ? "bg-primary" : "bg-base-300"
                }`}
              />
            </div>

            <div className="timeline-end timeline-box">
              <p
                className={`text-sm ${
                  isCurrent ? "font-bold text-primary" : "font-medium"
                }`}
              >
                {step.label}
              </p>
            </div>

            {index < DELIVERY_STEP_GROUPS.length - 1 && (
              <hr className={isDone ? "bg-primary" : ""} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

const OrderDetailContent = ({ order }) => {
  const statusMeta = getStatusMeta(order.status);
  const farmerName = order.farmer?.user?.name;
  const customerName = order.customer?.user?.name;
  const driver = order.delivery?.driver;
  const courier = order.delivery?.courier;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-light">Order</p>
          <h2 className="text-lg font-bold">{order.orderNumber}</h2>
        </div>
        <span className={`badge ${statusMeta.badge}`}>{statusMeta.label}</span>
      </div>

      {/* Items */}
      <Section title="Items" icon={<FiPackage />}>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item._id || item.name} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-field bg-base-200 flex items-center justify-center overflow-hidden shrink-0">
                {item.product?.images?.[0]?.url ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiPackage className="text-muted-light" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-light">
                  {item.quantity} {item.unit} × ৳{item.price}
                </p>
              </div>

              <p className="text-sm font-semibold">৳{item.subtotal}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Farm / Farmer */}
      {order.farm && (
        <Section title="Farm" icon={<FiUser />}>
          <Row label="Farm" value={order.farm.name} />
          {farmerName && <Row label="Farmer" value={farmerName} />}
        </Section>
      )}

      {/* Customer */}
      {order.customer && (
        <Section title="Customer" icon={<FiUser />}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-xs font-semibold shrink-0">
              {getInitials(customerName)}
            </div>
            <p className="text-sm font-medium">{customerName || "Customer"}</p>
          </div>
          <Row
            label="Address"
            value={`${order.deliveryAddress?.village}, ${order.deliveryAddress?.upazila}, ${order.deliveryAddress?.district}`}
          />
          <Row label="Phone" value={order.deliveryAddress?.phone} />
        </Section>
      )}

      {/* Delivery */}
      <Section title="Delivery" icon={<FiTruck />}>
        <Row label="From" value={order.delivery?.originZone?.label} />
        <Row label="To" value={order.delivery?.destinationZone?.label} />
        <Row
          label="Estimated Delivery"
          value={
            order.delivery?.estimatedDeliveryAt &&
            new Date(order.delivery.estimatedDeliveryAt).toLocaleString()
          }
        />
        <Row label="Courier" value={courier?.name} />
        <Row
          label="Driver"
          value={
            driver?.name
              ? `${driver.name}${driver.phone ? ` · ${driver.phone}` : ""}`
              : "Not assigned yet"
          }
        />
      </Section>

      {/* Payment */}
      <Section title="Payment" icon={<FiCreditCard />}>
        <Row
          label="Method"
          value={order.payment?.method === "online" ? "Online" : "Cash on Delivery"}
        />
        <Row label="Status" value={order.payment?.status} />
        <Row label="Items Total" value={`৳${order.pricing?.itemsTotal}`} />
        <Row label="Delivery Charge" value={`৳${order.pricing?.deliveryCharge}`} />
        {order.pricing?.discount > 0 && (
          <Row label="Discount" value={`-৳${order.pricing.discount}`} />
        )}
        {order.pricing?.pointsRedeemed > 0 && (
          <Row label="Points Redeemed" value={`-৳${order.pricing.pointsRedeemed}`} />
        )}
        <div className="border-t border-theme-light mt-2 pt-2">
          <Row label="Total" value={`৳${order.pricing?.total}`} />
        </div>
      </Section>

      {/* Timeline */}
      <Section title="Order Timeline" icon={<FiClock />}>
        <DeliveryTimeline status={order.status} />
      </Section>
    </div>
  );
};

export default OrderDetailContent;