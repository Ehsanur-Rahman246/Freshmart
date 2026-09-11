import {
  BASE_DELIVERY_CHARGE,
  DELIVERY_RATE_PER_HOUR,
  SAME_ZONE_TRANSIT_HOURS,
  LOCAL_PICKUP_HOURS,
  DISPATCH_HOURS,
  LOCAL_DELIVERY_HOURS,
} from "../config/time.js";

// Used only at order creation to show the customer an ETA and to
// compute the delivery charge. Actual per-hop timing during the real
// delivery run is re-rolled by the scheduler (jobs/deliveryProgression.js).
const computeDeliveryEstimate = (originZone, destinationZone) => {
  let transitHours;

  if (originZone._id.toString() === destinationZone._id.toString()) {
    transitHours =
      (SAME_ZONE_TRANSIT_HOURS.min + SAME_ZONE_TRANSIT_HOURS.max) / 2;
  } else {
    const route = originZone.routes.find(
      (r) => r.toZone === destinationZone.zoneId,
    );

    transitHours = route
      ? (route.minHours + route.maxHours) / 2
      : (SAME_ZONE_TRANSIT_HOURS.min + SAME_ZONE_TRANSIT_HOURS.max) / 2;
  }

  const totalHours =
    LOCAL_PICKUP_HOURS + DISPATCH_HOURS + transitHours + LOCAL_DELIVERY_HOURS;

  const deliveryCharge = Math.round(
    BASE_DELIVERY_CHARGE + totalHours * DELIVERY_RATE_PER_HOUR,
  );

  return {
    estimatedHours: Math.round(totalHours),
    deliveryCharge,
  };
};

export default computeDeliveryEstimate;
