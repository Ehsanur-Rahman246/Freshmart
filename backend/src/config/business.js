// Business-tuning constants that aren't about time.
// Adjust freely; nothing else needs to change when these do.

export const DEMO_COMPANY_NAME = "AgroCorp BD";

export const COMPANY_SALE_DISCOUNT = 0.1; // 10% off listing price

export const DEMO_RESTOCK_QUANTITY = 50;

// --- Revenue / commission rates ---

// Normal customer sale (order reaches "delivered"): split of pricing.itemsTotal.
// Delivery charge and any points-redeemed discount are NOT commissioned —
// only the value of goods sold.
export const ADMIN_SALE_COMMISSION = 0.12; // 12% to admin
export const FARMER_SALE_SHARE = 0.88; // 88% to farm/farmer

// Company sale (expired listing sold to a company, demo instant or
// real-farmer admin-finalized): companySalePrice = product.price * (1 - COMPANY_SALE_DISCOUNT).
// Of that discounted price:
export const FARMER_COMPANY_SALE_SHARE = 0.7; // 70% to farmer
export const ADMIN_COMPANY_SALE_COMMISSION = 0.3; // 30% to admin