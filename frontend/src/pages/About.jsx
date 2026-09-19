import { Link } from "react-router";

const VALUES = [
  {
    title: "Farm-Fresh, Always",
    desc: "Produce moves from farm to your door within hours, not weeks — no long cold-storage chains.",
    bg: "bg-primary-soft",
  },
  {
    title: "Fair Pay for Farmers",
    desc: "Farmers keep the majority share of every sale, with transparent, zone-based logistics instead of middlemen markups.",
    bg: "bg-secondary-soft",
  },
  {
    title: "Community First",
    desc: "Every order supports a real local farm and the community of drivers and couriers who deliver it.",
    bg: "bg-accent-soft",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Farmers List Their Harvest",
    desc: "Local farmers list fresh produce straight from their farm, with photos, pricing, and available stock.",
  },
  {
    step: "02",
    title: "Customers Order Directly",
    desc: "Browse by farm or product, add to cart, and check out — no distributor in between.",
  },
  {
    step: "03",
    title: "Zone-Based Delivery",
    desc: "Our courier network moves your order zone-to-zone, with live status updates until it reaches your door.",
  },
];

export default function About() {
  return (
    <div className="bg-base-100 min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
        <span className="badge bg-primary-soft text-primary border-none font-semibold mb-4">
          Our Story
        </span>
        <h1 className="text-4xl md:text-5xl mb-4">
          About <span className="logo">FreshMart</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          FreshMart connects local farmers directly with customers — cutting out
          the middlemen, so produce stays fresher and farmers earn more.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <h2 className="text-2xl mb-3">Our Mission</h2>
        <p className="text-muted leading-relaxed">
          We believe fresh, honest food shouldn't have to travel through five
          different hands before it reaches your table. FreshMart gives farmers
          a direct storefront and gives customers a shorter, more transparent
          path from harvest to home.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-base-200 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="card bg-base-100 border border-theme-light p-6"
              >
                <span className="text-3xl font-extrabold text-primary/30">
                  {s.step}
                </span>
                <h3 className="text-lg mt-2 mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl text-center mb-10">What We Stand For</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className={`rounded-box p-6 ${v.bg}`}>
              <h3 className="text-lg mb-2">{v.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-20 px-6">
        <h2 className="text-2xl mb-4">Ready to taste the difference?</h2>
        <Link to="/marketplace" className="btn btn-primary rounded-field">
          Browse Fresh Products
        </Link>
      </section>
    </div>
  );
}
