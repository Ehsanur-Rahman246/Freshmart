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
  "orderPlaced", 
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