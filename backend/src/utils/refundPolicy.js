export const REFUND_TIERS = {
  pendingAcceptance: 100,
  orderPlaced: 100, 
  paymentPending: 100,
  processing: 100,
  readyForPickup: 100,
  pickedUp: 70,
  toOriginCenter: 40,
  inTransit: 40,
  toDestinationCenter: 40,
};

export const PRE_PICKUP_STATUSES = [
  "pendingAcceptance",
  "orderPlaced", 
  "paymentPending",
  "processing",
  "readyForPickup",
];

export const TERMINAL_STATUSES = ["delivered", "cancelled", "rejected"];

export const ACTIVE_COMPANY_SALE_STAGES = [
  "awaitingFarmerResponse",
  "processing",
  "readyForPickup",
  "pickedUp",
];