export const STATUS_META = {
  pendingAcceptance: { label: "Pending Acceptance", badge: "badge-warning" },
  paymentPending: { label: "Awaiting Payment", badge: "badge-warning" },
  processing: { label: "Processing", badge: "badge-info" },
  readyForPickup: { label: "Ready for Pickup", badge: "badge-info" },
  pickedUp: { label: "Picked Up", badge: "badge-info" },
  toOriginCenter: { label: "To Origin Center", badge: "badge-info" },
  inTransit: { label: "In Transit", badge: "badge-info" },
  toDestinationCenter: { label: "To Destination Center", badge: "badge-info" },
  outForDelivery: { label: "Out for Delivery", badge: "badge-info" },
  delivered: { label: "Delivered", badge: "badge-success" },
  rejected: { label: "Rejected", badge: "badge-error" },
  cancelled: { label: "Cancelled", badge: "badge-error" },
};

export const getStatusMeta = (status) =>
  STATUS_META[status] || { label: status, badge: "badge-neutral" };

// Collapsed groups for the order-tracking timeline.
export const DELIVERY_STEP_GROUPS = [
  { key: "placed", label: "Order Placed", statuses: ["pendingAcceptance"] },
  {
    key: "processing",
    label: "Accepted & Processing",
    statuses: ["paymentPending", "processing"],
  },
  { key: "ready", label: "Ready for Pickup", statuses: ["readyForPickup"] },
  { key: "pickedUp", label: "Picked Up", statuses: ["pickedUp"] },
  {
    key: "transit",
    label: "In Transit",
    statuses: ["toOriginCenter", "inTransit", "toDestinationCenter"],
  },
  { key: "outForDelivery", label: "Out for Delivery", statuses: ["outForDelivery"] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
];

export const isTerminalFailure = (status) =>
  status === "cancelled" || status === "rejected";

export const getActiveStepIndex = (status) => {
  if (isTerminalFailure(status)) return -1;
  return DELIVERY_STEP_GROUPS.findIndex((group) =>
    group.statuses.includes(status),
  );
};