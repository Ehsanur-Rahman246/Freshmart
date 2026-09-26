// PrivacyPolicy.jsx
const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect the information you provide when creating an account
    (name, email, phone number), delivery addresses, order history, and,
    for farmers, farm and product details. If you upload a profile photo
    or farm/product images, those are stored via our image hosting
    provider.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `Your information is used to process orders, calculate delivery
    estimates and charges, send order-status notifications and emails,
    and to display your public profile details (such as your name on
    reviews) to other users where relevant.`,
  },
  {
    title: "3. Cookies & Authentication",
    body: `FreshMart uses a secure, HTTP-only authentication cookie to
    keep you logged in. This cookie is required for the platform to
    function and is not used for advertising or third-party tracking.`,
  },
  {
    title: "4. Third-Party Services",
    body: `We use trusted third-party services to operate FreshMart:
    an image hosting provider for photos, an email service for
    transactional emails (order updates, OTPs, account notices), and
    payment processing for online orders. These providers only receive
    the information necessary to perform their function.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your account and order information for as long as
    your account is active. If you delete your account, your profile
    data is removed; some order records may be retained as required for
    financial and operational record-keeping.`,
  },
  {
    title: "6. Your Rights",
    body: `You can view and update your profile information at any time
    from your account settings, and you can permanently delete your
    account and associated profile data whenever you choose.`,
  },
  {
    title: "7. Data Security",
    body: `Passwords are stored using industry-standard hashing, and
    sensitive account actions (like password resets) use time-limited,
    single-use verification codes.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Material
    changes will be reflected here with an updated date.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-base-100 min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
        <span className="badge bg-primary-soft text-primary border-none font-semibold mb-4">
          Legal
        </span>
        <h1 className="text-4xl md:text-5xl mb-4">Privacy Policy</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          How FreshMart collects, uses, and protects your information.
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

        <div className="mt-6 rounded-box p-6 bg-accent-soft">
          <p className="text-muted text-sm leading-relaxed">
            Have privacy questions or want your data removed? Delete your
            account anytime from your profile, or contact us through support.
          </p>
        </div>
      </section>
    </div>
  );
}
