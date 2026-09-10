// All "hour" values in this file represent SIMULATED delivery hours.
// HOUR_IN_MS controls how long one simulated hour actually takes in real time.
//
// DEMO MODE (current): 1 simulated hour = 1 real minute, so a full
// delivery cycle (pickedUp -> delivered) finishes in a few real minutes
// instead of taking a day.
//
// TO SWITCH TO REAL-WORLD TIMING LATER:
// 1. Change HOUR_IN_MS below to 60 * 60 * 1000 (1 simulated hour = 1 real hour).
// 2. Change CRON_INTERVAL to something coarser, e.g. "*/5 * * * *" (every 5 min) —
//    checking every 10 seconds is pointless once hops take real hours.
// Nothing else in the codebase needs to change; every other file reads hours
// through HOUR_IN_MS.
export const HOUR_IN_MS = 60 * 1000;

// How often the delivery scheduler checks for orders ready to advance.
export const CRON_INTERVAL = "*/10 * * * * *";

// Local leg durations (in simulated hours) — not looked up from Zone routes,
// these represent short local movements rather than inter-zone travel.
export const LOCAL_PICKUP_HOURS = 1; // farm -> origin zone center
export const DISPATCH_HOURS = 1; // origin center depart buffer before inter-zone transit begins
export const DESTINATION_PROCESSING_HOURS = 1; // Buffer at the destination zone center before local delivery begins.
export const LOCAL_DELIVERY_HOURS = 1; // destination zone center -> customer's door

// Fallback transit range when origin and destination zone are the same,
// or a matching Zone.routes entry can't be found.
export const SAME_ZONE_TRANSIT_HOURS = { min: 2, max: 4 };

// Delivery charge formula: flat base + a per-hour rate over total estimated hours.
export const BASE_DELIVERY_CHARGE = 20;
export const DELIVERY_RATE_PER_HOUR = 5;

// --- Demo farmer automation timing ---

// How long a demo order stays "processing" before auto-advancing to
// readyForPickup.
export const DEMO_PROCESSING_HOURS = 2;

// How long a demo product stays "soldOut" before a fresh listing is
// auto-created to replace it.
export const DEMO_RESTOCK_GAP_HOURS = 6;

// How long a REAL farmer has to respond to an expired listing's
// company-sale offer before it's auto-rejected.
export const FARMER_RESPONSE_WINDOW_HOURS = 72;
