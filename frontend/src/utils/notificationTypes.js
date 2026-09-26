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

// productExpired = an expired listing entering the company-sale flow;
// the other two are later stages of that same flow.
export const FARMER_PRODUCT_TYPES = [
  "productExpired",
  "companySalePickedUp",
  "companySaleFinalized",
];

// product reviews carry relatedProduct, farm reviews only carry relatedOrder —
// callers should not require relatedProduct to be present for this type.
export const FARMER_REVIEW_TYPES = ["reviewReceived"];

export const ADMIN_ORDER_TYPES = [
  "orderPlaced",
  "orderCancelled",
  "orderRejected",
  "readyForPickup",
  "delivered",
];

export const ADMIN_REVIEW_TYPES = ["reviewReported"];

export const ADMIN_COMPANY_SALE_TYPES = [
  "companySaleReady",
  "companySaleOfferAccepted",
  "companySalePickedUp",
  "companySaleFinalized",
  "productAdded",
  "productExpired",
];

// shared across every role
export const MESSAGE_TYPES = ["newMessage"];