// All notification `type` values your backend currently sends, grouped by
// which role acts on them. Kept in one place so adding a new type later is
// a one-line change instead of hunting through three pages.
//
// If a type isn't listed for a role, that role's card still shows fine —
// it just isn't clickable to a detail page (falls through to null / mark-as-read only).

export const CUSTOMER_ORDER_TYPES = [
  "orderAccepted",
  "orderRejected",
  "orderCancelled",
  "orderProcessing",
  "readyForPickup",
  "paymentRequired",
  "driverAssigned",
  "pickedUp",
  "toOriginCenter",
  "inTransit",
  "toDestinationCenter",
  "outForDelivery",
  "delivered",
  "paymentSuccess",
  "paymentFailed",
];

export const FARMER_ORDER_TYPES = [
  "orderPlaced", // new order for the farmer to accept/reject
  "orderAccepted",
  "orderRejected",
  "orderCancelled",
  "orderProcessing",
  "readyForPickup",
  "delivered",
  "paymentSuccess",
  "paymentFailed",
];

export const FARMER_PRODUCT_TYPES = ["productExpired"];
export const FARMER_REVIEW_TYPES = ["reviewReceived"];

export const ADMIN_ORDER_TYPES = [
  "orderPlaced",
  "orderCancelled",
  "orderRejected",
  "readyForPickup",
  "delivered",
];

export const ADMIN_REVIEW_TYPES = ["reviewReported"];