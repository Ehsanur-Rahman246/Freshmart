import Revenue from "../models/Revenue.js";
import {
  ADMIN_SALE_COMMISSION,
  FARMER_SALE_SHARE,
  FARMER_COMPANY_SALE_SHARE,
  ADMIN_COMPANY_SALE_COMMISSION,
} from "../config/business.js";

// Normal customer order reaching "delivered".
export const recordSaleRevenue = async (order) => {
  const grossAmount = order.pricing.itemsTotal;

  const adminRevenue =
    Math.round(grossAmount * ADMIN_SALE_COMMISSION * 100) / 100;
  const farmerRevenue = Math.round(grossAmount * FARMER_SALE_SHARE * 100) / 100;

  await Revenue.create({
    type: "sale",
    order: order._id,
    product: null,
    farm: order.farm,
    farmer: order.farmer,
    grossAmount,
    adminRevenue,
    farmerRevenue,
    commissionRate: ADMIN_SALE_COMMISSION,
  });
};

// Company sale finalized (demo instant sale, or real-farmer admin-finalized sale).
// quantity = stock at the moment of sale (must be passed in before stock is
// cleared/zeroed, if that's ever done elsewhere).
export const recordCompanySaleRevenue = async (product, quantity) => {
  const grossAmount =
    Math.round(product.companySalePrice * quantity * 100) / 100;

  const farmerRevenue =
    Math.round(grossAmount * FARMER_COMPANY_SALE_SHARE * 100) / 100;
  const adminRevenue =
    Math.round(grossAmount * ADMIN_COMPANY_SALE_COMMISSION * 100) / 100;

  await Revenue.create({
    type: "companySale",
    order: null,
    product: product._id,
    farm: product.farm,
    farmer: product.farmer,
    grossAmount,
    adminRevenue,
    farmerRevenue,
    commissionRate: ADMIN_COMPANY_SALE_COMMISSION,
  });
};
