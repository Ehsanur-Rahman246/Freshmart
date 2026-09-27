// Colors/fonts are hardcoded from index.css since email clients can't read CSS variables.

const SITE_URL = (process.env.CLIENT_URL || "").split(",")[0] || "#";

const LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  "https://placehold.co/72x72/45a15c/ffffff?text=FM"; // placeholder — swap later

const WORDMARK_URL =
  process.env.EMAIL_WORDMARK_URL || "https://res.cloudinary.com/bzr9xwza/image/upload/v1790360649/freshmart-wordmark.png";

const SOCIAL_LINKS = {
  facebook: process.env.SOCIAL_FACEBOOK || "#",
  instagram: process.env.SOCIAL_INSTAGRAM || "#",
  x: process.env.SOCIAL_X || "#",
  whatsapp: process.env.SOCIAL_WHATSAPP || "#",
};

const C = {
  base100: "#F3EFE8",
  base200: "#F8F6F2",
  base300: "#FBFAF8",
  baseContent: "#17110D",
  primary: "#45A15C",
  primaryContent: "#FFFFFF",
  primarySoft: "#E1F1E4",
  secondary: "#D89B3C",
  secondarySoft: "#FAECD5",
  success: "#2F7D3B",
  successSoft: "#DDF1E0",
  warning: "#9A6B00",
  warningSoft: "#FFF0C7",
  error: "#C53030",
  errorSoft: "#F9DEDE",
  muted: "#7B5A42",
  mutedLight: "#9D816C",
  border: "#DED8CE",
  borderLight: "#E9E4DD",
};

const FONT_SANS =
  "'Nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

const money = (n) => `৳${(Number(n) || 0).toFixed(2)}`;
const PLACEHOLDER_IMAGE = "https://placehold.co/72x72/e1f1e4/45a15c?text=FM";

// ---------------- shared pieces ----------------

const header = () => `
<tr>
  <td style="padding:28px 32px;text-align:center;background:${C.base300};border-bottom:1px solid ${C.borderLight};">
    <img src="${LOGO_URL}" width="36" height="36" alt="FreshMart" style="display:inline-block;vertical-align:middle;border-radius:8px;margin-right:10px;">
    <img src="${WORDMARK_URL}" height="26" alt="FreshMart" style="display:inline-block;vertical-align:middle;">
  </td>
</tr>`;

const socialBadge = (label, url) => `
<a href="${url}" style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background:${C.primarySoft};color:${C.primary};font-family:${FONT_SANS};font-size:12px;font-weight:700;text-align:center;margin:0 4px;text-decoration:none;">${label}</a>`;

const footer = () => `
<tr>
  <td style="padding:28px 32px;text-align:center;background:${C.base200};border-top:1px solid ${C.borderLight};">
    <div style="margin-bottom:12px;">
      <img src="${LOGO_URL}" width="24" height="24" alt="FreshMart" style="display:inline-block;vertical-align:middle;border-radius:6px;margin-right:6px;">
      <img src="${WORDMARK_URL}" height="18" alt="FreshMart" style="display:inline-block;vertical-align:middle;">
    </div>
    <div style="margin-bottom:14px;">
      ${socialBadge("f", SOCIAL_LINKS.facebook)}
      ${socialBadge("IG", SOCIAL_LINKS.instagram)}
      ${socialBadge("X", SOCIAL_LINKS.x)}
      ${socialBadge("WA", SOCIAL_LINKS.whatsapp)}
    </div>
    <p style="margin:0;font-family:${FONT_SANS};font-size:12px;color:${C.mutedLight};">
      &copy; ${new Date().getFullYear()} FreshMart. All rights reserved.
    </p>
  </td>
</tr>`;

const layout = (bodyHtml, preheader = "") => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FreshMart</title>
</head>
<body style="margin:0;padding:0;background:${C.base100};font-family:${FONT_SANS};">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.base100};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:${C.base300};border-radius:14px;overflow:hidden;border:1px solid ${C.borderLight};">
          ${header()}
          <tr>
            <td style="padding:32px;font-family:${FONT_SANS};color:${C.baseContent};">
              ${bodyHtml}
            </td>
          </tr>
          ${footer()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const button = (label, url, bg = C.primary, textColor = C.primaryContent) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
  <tr>
    <td style="border-radius:10px;background:${bg};">
      <a href="${url}" style="display:inline-block;padding:12px 28px;font-family:${FONT_SANS};font-size:15px;font-weight:700;color:${textColor};text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;

const statusPill = (label, bg, color) => `
<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${bg};color:${color};font-family:${FONT_SANS};font-size:13px;font-weight:700;">${label}</span>`;

const statRow = (label, value, opts = {}) => `
<tr>
  <td style="padding:6px 0;font-family:${FONT_SANS};font-size:14px;color:${C.muted};">${label}</td>
  <td style="padding:6px 0;font-family:${FONT_SANS};font-size:14px;color:${opts.color || C.baseContent};font-weight:${opts.bold ? 700 : 600};text-align:right;">${value}</td>
</tr>`;

const sectionHeading = (label) => `
<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${C.mutedLight};">${label}</p>`;

const card = (innerHtml) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.base200};border:1px solid ${C.borderLight};border-radius:12px;margin:0 0 20px;">
  <tr><td style="padding:18px 20px;">${innerHtml}</td></tr>
</table>`;

const itemRow = (item) => {
  const image = item.product?.images?.[0]?.url || PLACEHOLDER_IMAGE;
  return `
<tr>
  <td style="padding:12px 0;border-bottom:1px solid ${C.borderLight};" width="64">
    <img src="${image}" width="56" height="56" alt="${item.name}" style="border-radius:10px;object-fit:cover;display:block;">
  </td>
  <td style="padding:12px 12px;border-bottom:1px solid ${C.borderLight};font-family:${FONT_SANS};">
    <div style="font-size:14px;font-weight:700;color:${C.baseContent};">${item.name}</div>
    <div style="font-size:12px;color:${C.mutedLight};margin-top:2px;">${item.quantity} ${item.unit} &times; ${money(item.price)}</div>
  </td>
  <td style="padding:12px 0;border-bottom:1px solid ${C.borderLight};font-family:${FONT_SANS};font-size:14px;font-weight:700;color:${C.success};text-align:right;white-space:nowrap;">
    ${money(item.subtotal)}
  </td>
</tr>`;
};

const itemsTable = (items) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;">
  ${items.map(itemRow).join("")}
</table>`;

// ---------------- auth ----------------

export const welcomeEmail = ({ name, role }) => {
  const isFarmer = role === "farmer";
  const heading = isFarmer
    ? "Welcome to FreshMart, Farmer!"
    : "Welcome to FreshMart!";
  const intro = isFarmer
    ? "We're excited to have you join our community of farmers. Set up your farm profile and start listing fresh produce for customers across Bangladesh."
    : "We're excited to have you join our community. Explore fresh produce straight from local farmers.";
  const ctaLabel = isFarmer ? "Add Your First Listing" : "Shop Now";
  const ctaUrl = isFarmer
    ? `${SITE_URL}/farmer/listings`
    : `${SITE_URL}/customer/marketplace`;

  const body = `
    <h1 style="margin:0 0 6px;font-size:24px;color:${C.baseContent};">${heading}</h1>
    <p style="margin:0 0 4px;font-size:15px;color:${C.muted};">Hi ${name || "there"},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${C.muted};">${intro}</p>
    ${button(ctaLabel, ctaUrl)}
    <p style="margin:20px 0 0;font-size:13px;color:${C.mutedLight};">Thank you for choosing FreshMart!</p>
  `;
  return layout(body, `Welcome to FreshMart${name ? `, ${name}` : ""}`);
};

const otpTemplate = ({ name, otp, minutes, heading, intro }) => {
  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;color:${C.baseContent};">${heading}</h1>
    <p style="margin:0 0 4px;font-size:15px;color:${C.muted};">Hi ${name || "there"},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${C.muted};">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center" style="background:${C.primarySoft};border:1px dashed ${C.primary};border-radius:12px;padding:18px;">
          <span style="font-family:${FONT_SANS};font-size:32px;font-weight:800;letter-spacing:6px;color:${C.primary};">${otp}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:${C.mutedLight};">This code expires in ${minutes} minutes. If you didn't request this, you can safely ignore this email.</p>
  `;
  return layout(body, `Your FreshMart code is ${otp}`);
};

export const verificationOtpEmail = ({ name, otp, minutes }) =>
  otpTemplate({
    name,
    otp,
    minutes,
    heading: "Verify your account",
    intro: "Use the code below to verify your FreshMart account.",
  });

export const resetPasswordOtpEmail = ({ name, otp, minutes }) =>
  otpTemplate({
    name,
    otp,
    minutes,
    heading: "Reset your password",
    intro: "Use the code below to reset your FreshMart password.",
  });

// ---------------- announcement ----------------

export const announcementEmail = ({ name, title, message }) => {
  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;color:${C.baseContent};">${title}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:${C.muted};">Hi ${name || "there"},</p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${C.baseContent};white-space:pre-line;">${message}</p>
  `;
  return layout(body, title);
};

// ---------------- orders ----------------

export const orderPlacedEmail = ({ order, customerName }) => {
  const p = order.pricing;
  const body = `
    ${statusPill("Order Placed", C.successSoft, C.success)}
    <h1 style="margin:14px 0 4px;font-size:22px;color:${C.baseContent};">Order ${order.orderNumber}</h1>
    <p style="margin:0 0 20px;font-size:15px;color:${C.muted};">Hi ${customerName || "there"}, ${order.farm?.name || "the farm"} is preparing your order.</p>

    ${sectionHeading("Items")}
    ${itemsTable(order.items)}

    ${card(`
      ${sectionHeading("Order Summary")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${statRow("Items Total", money(p.itemsTotal))}
        ${statRow("Delivery Charge", money(p.deliveryCharge))}
        ${p.discount ? statRow("Discount", `-${money(p.discount)}`, { color: C.error }) : ""}
        ${p.pointsRedeemed ? statRow("Points Redeemed", `-${money(p.pointsRedeemed)}`, { color: C.error }) : ""}
        ${p.promoDiscount ? statRow("Promo Discount", `-${money(p.promoDiscount)}`, { color: C.error }) : ""}
        ${p.debtSettled ? statRow("Previous Balance Settled", money(p.debtSettled)) : ""}
        ${statRow("Total", money(p.total), { bold: true, color: C.primary })}
      </table>
    `)}

    ${button("Track Your Order", `${SITE_URL}/customer/orders/${order._id}`)}
  `;
  return layout(body, `Your order ${order.orderNumber} has been placed`);
};

export const orderRejectedEmail = ({ order, customerName, reason }) => {
  const body = `
    ${statusPill("Order Rejected", C.errorSoft, C.error)}
    <h1 style="margin:14px 0 4px;font-size:22px;color:${C.baseContent};">Order ${order.orderNumber}</h1>
    <p style="margin:0 0 8px;font-size:15px;color:${C.muted};">Hi ${customerName || "there"}, unfortunately ${order.farm?.name || "the farm"} was unable to fulfill this order.</p>
    ${reason ? `<p style="margin:0 0 20px;font-size:14px;color:${C.error};background:${C.errorSoft};border-radius:10px;padding:12px 14px;">Reason: ${reason}</p>` : `<div style="margin-bottom:12px;"></div>`}

    ${sectionHeading("Items")}
    ${itemsTable(order.items)}

    <p style="margin:16px 0 0;font-size:13px;color:${C.mutedLight};">Any points or account balance used for this order have been returned to your wallet. You have not been charged.</p>
    ${button("Browse Other Products", `${SITE_URL}/customer/marketplace`)}
  `;
  return layout(body, `Your order ${order.orderNumber} could not be placed`);
};

export const orderCancelledEmail = ({
  order,
  recipientName,
  recipientRole = "customer",
  reason,
}) => {
  const isFarmer = recipientRole === "farmer";
  const refund = order.refund || { percentage: 0, amount: 0 };

  const intro = isFarmer
    ? `Hi ${recipientName || "there"}, an order from your farm has been cancelled.`
    : `Hi ${recipientName || "there"}, this order has been cancelled.`;

  const refundCard = isFarmer
    ? ""
    : card(`
      ${sectionHeading("Refund")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${statRow("Refund Percentage", `${refund.percentage}%`)}
        ${statRow("Refund Amount", money(refund.amount), { bold: true, color: C.primary })}
      </table>
    `);

  const footNote = isFarmer
    ? ""
    : `<p style="margin:0;font-size:13px;color:${C.mutedLight};">Refunded points or balance will reflect in your FreshMart wallet.</p>`;

  const body = `
    ${statusPill("Order Cancelled", C.warningSoft, C.warning)}
    <h1 style="margin:14px 0 4px;font-size:22px;color:${C.baseContent};">Order ${order.orderNumber}</h1>
    <p style="margin:0 0 8px;font-size:15px;color:${C.muted};">${intro}</p>
    ${reason ? `<p style="margin:0 0 20px;font-size:14px;color:${C.warning};background:${C.warningSoft};border-radius:10px;padding:12px 14px;">${reason}</p>` : `<div style="margin-bottom:12px;"></div>`}

    ${sectionHeading("Items")}
    ${itemsTable(order.items)}

    ${refundCard}
    ${footNote}
  `;
  return layout(body, `Order ${order.orderNumber} was cancelled`);
};

export const orderDeliveredEmail = ({
  order,
  recipientName,
  recipientRole = "customer",
}) => {
  const isFarmer = recipientRole === "farmer";

  const intro = isFarmer
    ? `Hi ${recipientName || "there"}, an order from your farm has been delivered to the customer.`
    : `Hi ${recipientName || "there"}, your order has been delivered. We hope you enjoy your fresh produce!`;

  const cta = isFarmer
    ? button("View Order", `${SITE_URL}/farmer/orders`)
    : button("Leave a Review", `${SITE_URL}/customer/orders/${order._id}`);

  const footNote = isFarmer
    ? "Thank you for being part of FreshMart!"
    : "Thank you for shopping with FreshMart!";

  const body = `
    ${statusPill("Delivered", C.successSoft, C.success)}
    <h1 style="margin:14px 0 4px;font-size:22px;color:${C.baseContent};">Order ${order.orderNumber} Delivered</h1>
    <p style="margin:0 0 20px;font-size:15px;color:${C.muted};">${intro}</p>

    ${sectionHeading("Items")}
    ${itemsTable(order.items)}

    ${cta}
    <p style="margin:16px 0 0;font-size:13px;color:${C.mutedLight};">${footNote}</p>
  `;
  return layout(body, `Order ${order.orderNumber} delivered`);
};

export const paymentInvoiceEmail = ({
  orders,
  transactionId,
  customerName,
}) => {
  const grand = orders.reduce(
    (acc, o) => ({
      itemsTotal: acc.itemsTotal + o.pricing.itemsTotal,
      deliveryCharge: acc.deliveryCharge + o.pricing.deliveryCharge,
      discount: acc.discount + (o.pricing.discount || 0),
      pointsRedeemed: acc.pointsRedeemed + (o.pricing.pointsRedeemed || 0),
      promoDiscount: acc.promoDiscount + (o.pricing.promoDiscount || 0),
      debtSettled: acc.debtSettled + (o.pricing.debtSettled || 0),
      total: acc.total + o.pricing.total,
    }),
    {
      itemsTotal: 0,
      deliveryCharge: 0,
      discount: 0,
      pointsRedeemed: 0,
      promoDiscount: 0,
      debtSettled: 0,
      total: 0,
    },
  );

  const farmSections = orders
    .map(
      (order) =>
        `${sectionHeading(order.farm?.name || "Farm")}${itemsTable(order.items)}`,
    )
    .join("");

  const body = `
    ${statusPill("Payment Successful", C.successSoft, C.success)}
    <h1 style="margin:14px 0 4px;font-size:22px;color:${C.baseContent};">Payment Invoice</h1>
    <p style="margin:0 0 4px;font-size:15px;color:${C.muted};">Hi ${customerName || "there"}, thank you for your payment.</p>
    <p style="margin:0 0 20px;font-size:13px;color:${C.mutedLight};">Transaction ID: <strong style="color:${C.baseContent};">${transactionId}</strong></p>

    ${farmSections}

    ${card(`
      ${sectionHeading("Invoice Summary")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${statRow("Items Total", money(grand.itemsTotal))}
        ${statRow("Delivery Charge", money(grand.deliveryCharge))}
        ${grand.discount ? statRow("Discount", `-${money(grand.discount)}`, { color: C.error }) : ""}
        ${grand.pointsRedeemed ? statRow("Points Redeemed", `-${money(grand.pointsRedeemed)}`, { color: C.error }) : ""}
        ${grand.promoDiscount ? statRow("Promo Discount", `-${money(grand.promoDiscount)}`, { color: C.error }) : ""}
        ${grand.debtSettled ? statRow("Previous Balance Settled", money(grand.debtSettled)) : ""}
        ${statRow("Grand Total Paid", money(grand.total), { bold: true, color: C.primary })}
      </table>
    `)}

    <p style="margin:0;font-size:13px;color:${C.mutedLight};">Keep this email as your receipt.</p>
  `;
  return layout(body, `Payment received — ${transactionId}`);
};

// ---------------- farmer: company sale offer ----------------

export const companySaleOfferEmail = ({
  product,
  companySalePrice,
  responseWindowHours,
  farmerName,
}) => {
  const image = product.images?.[0]?.url || PLACEHOLDER_IMAGE;
  const body = `
    ${statusPill("Company Sale Offer", C.secondarySoft, C.secondary)}
    <h1 style="margin:14px 0 4px;font-size:22px;color:${C.baseContent};">Your Listing Expired</h1>
    <p style="margin:0 0 20px;font-size:15px;color:${C.muted};">Hi ${farmerName || "there"}, your listing below expired with unsold stock. We're offering to buy it directly.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td width="72" style="padding:0;">
          <img src="${image}" width="64" height="64" alt="${product.name}" style="border-radius:12px;object-fit:cover;display:block;">
        </td>
        <td style="padding:0 0 0 14px;">
          <div style="font-size:15px;font-weight:700;color:${C.baseContent};">${product.name}</div>
          <div style="font-size:13px;color:${C.mutedLight};margin-top:2px;">${product.stock} ${product.unit} remaining</div>
        </td>
      </tr>
    </table>

    ${card(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${statRow("Original Price", money(product.price))}
        ${statRow("Company Offer Price", money(companySalePrice), { bold: true, color: C.primary })}
        ${statRow("Respond Within", `${responseWindowHours} hours`)}
      </table>
    `)}

    ${button("Respond to Offer", `${SITE_URL}/farmer/company-sales`)}
    <p style="margin:16px 0 0;font-size:13px;color:${C.mutedLight};">If you don't respond in time, this offer will be automatically declined.</p>
  `;
  return layout(body, `Company sale offer for ${product.name}`);
};
