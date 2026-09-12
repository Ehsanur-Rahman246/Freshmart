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

// --- Demo customer automation ---

export const DEMO_CUSTOMERS_PER_ZONE = 2; // 2 demo customers seeded per zone (10 total across 5 zones)

export const DEMO_CUSTOMERS_ACTIVE_PER_DAY = 7; // how many of the 10 demo customers place an order each day

export const DEMO_WISHLIST_SEED_MIN = 3; // initial wishlist size (one-off seed script)
export const DEMO_WISHLIST_SEED_MAX = 5;

export const DEMO_WISHLIST_DAILY_ADD_MIN = 2; // new items added to wishlist per active day
export const DEMO_WISHLIST_DAILY_ADD_MAX = 3;

export const DEMO_CART_FARM_PRODUCT_COUNT = 3; // number of distinct products picked from the random farm

export const DEMO_CART_PRODUCT_QTY_MIN = 3; // quantity range per product added from the random farm
export const DEMO_CART_PRODUCT_QTY_MAX = 10;