// TermsConditions.jsx
const SECTIONS = [
  {
    title: "1. Accounts & Roles",
    body: `FreshMart supports three account types: Customer, Farmer, and Admin.
    You are responsible for keeping your login credentials secure and for all
    activity under your account. Farmers must accurately represent their farm,
    products, and stock at all times.`,
  },
  {
    title: "2. Orders & Payment",
    body: `Orders can be paid via Cash on Delivery or online payment. Prices
    shown at checkout include any active discounts and delivery charges.
    Orders are subject to farmer acceptance — a farmer may reject an order
    they cannot fulfill, in which case any reserved stock is released and
    the order is cancelled at no cost to the customer.`,
  },
  {
    title: "3. Cancellations & Refunds",
    body: `Customers may cancel an order before delivery. Refund amount
    depends on how far the order has progressed:
    100% refund while the order is pending, processing, or ready for
    pickup; 70% once a driver has picked it up; 40% once it is in transit
    or at a destination center. Orders that are out for delivery or
    already delivered cannot be cancelled. Refunds for online payments are
    credited as FreshMart points; for Cash on Delivery orders, any
    forfeited portion is added to your account balance as a debt owed on
    your next order.`,
  },
  {
    title: "4. Delivery & Zones",
    body: `Delivery times shown at checkout are estimates based on your
    zone and the farm's zone, and may vary due to courier availability or
    unforeseen delays. FreshMart is not liable for delays caused by
    circumstances outside our reasonable control.`,
  },
  {
    title: "5. Reviews & Conduct",
    body: `Reviews must reflect a genuine order experience and may only be
    left for products or farms tied to a delivered order. Abusive,
    fraudulent, or misleading reviews may be removed, and repeated
    violations may result in account suspension.`,
  },
  {
    title: "6. Company Sale of Expired Stock",
    body: `Listings that expire with unsold stock may be offered for
    company purchase at a discounted rate. Farmers are notified and may
    accept or decline this offer within the response window shown in their
    dashboard; unanswered offers are automatically declined.`,
  },
  {
    title: "7. Account Termination",
    body: `You may delete your account at any time from your profile
    settings. FreshMart reserves the right to suspend or deactivate
    accounts that violate these terms, engage in fraud, or abuse the
    platform.`,
  },
  {
    title: "8. Changes to These Terms",
    body: `We may update these Terms & Conditions from time to time.
    Continued use of FreshMart after changes are posted constitutes
    acceptance of the revised terms.`,
  },
];

export default function TermsConditions() {
  return (
    <div className="bg-base-100 min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
        <span className="badge bg-secondary-soft text-secondary border-none font-semibold mb-4">
          Legal
        </span>
        <h1 className="text-4xl md:text-5xl mb-4">Terms & Conditions</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          The rules that govern using FreshMart as a customer, farmer, or admin.
        </p>
        <p className="text-muted-light text-sm mt-4">
          Last updated: September 2026
        </p>
      </section>

      {/* Sections */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="card bg-base-100 border border-theme-light p-6"
            >
              <h2 className="text-lg mb-2">{s.title}</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-box p-6 bg-primary-soft">
          <p className="text-muted text-sm leading-relaxed">
            Questions about these terms? Contact us through your account support
            page.
          </p>
        </div>
      </section>
    </div>
  );
}
