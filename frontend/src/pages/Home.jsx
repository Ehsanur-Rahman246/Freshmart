import { useState, useEffect } from "react";
import { Link } from "react-router";
import { FaArrowRightLong } from "react-icons/fa6";
import Footer from "../components/Footer";
import HomeNavbar from "../components/HomeNavbar";
import heroImage from "../assets/hero.png";

const ROTATING_WORDS = [
  { text: "priced fairly.", className: "text-primary" },
  { text: "grown nearby.", className: "text-secondary" },
  { text: "shared locally.", className: "text-accent" },
  { text: "sold directly.", className: "text-primary" },
  { text: "loved widely.", className: "text-secondary" },
];

const INTERVAL = 3400;

const HeroSlogan = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, INTERVAL);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-2xl">

      {/* Eyebrow */}
      <p className="font-pacifico mb-3 text-sm sm:text-base font-bold uppercase tracking-[0.16em] text-primary-active">
        Farm-to-customer marketplace
      </p>

      {/* Slogan */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-base-content">
        <span className="block">Fresh food,</span>

        <span className="relative mt-1 block h-[1.15em] overflow-hidden">
          {ROTATING_WORDS.map((word, idx) => (
            <span
              key={word.text}
              className={`
                absolute inset-0 flex items-center
                italic font-extrabold
                transition-all duration-500 ease-out
                ${word.className}
                ${
                  idx === current
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }
              `}
            >
              {word.text}
            </span>
          ))}
        </span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed font-medium text-muted">
        No middlemen marking things up. No mystery about where it came from.
        Just your neighbors' harvest, priced by real supply and demand,
        delivered to your door.
      </p>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link
          to="/register/customer"
          className="
            btn btn-primary
            rounded-full
            px-7
            shadow-lg
            transition-all duration-300
            hover:-translate-y-0.5
            hover:shadow-xl
          "
        >
          Start shopping
        </Link>

        <Link
          to="/register/farmer"
          className="
            group
            inline-flex items-center gap-2
            font-semibold
            text-base-content
            border-b border-base-content/40
            pb-0.5
            transition-all duration-300
            hover:border-primary
            hover:text-primary
          "
        >
          Become a farmer

          <FaArrowRightLong
            className="
              text-lg
              transition-transform duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <>
      <HomeNavbar />

      <section className="relative w-full overflow-hidden">
        {/* Hero image */}
        <img
          src={heroImage}
          alt="Fresh produce and farmland"
          className="
            block
            w-full
            h-auto
            min-h-[520px]
            object-cover
            object-center
          "
        />

        {/* Secondary-soft overlay */}
        <div
          className="
            absolute inset-0
            pointer-events-none
            bg-gradient-to-r
            from-[#faecd5]/95
            via-[#faecd5]/65
            via-45%
            to-transparent
          "
        />

        {/* Subtle bottom fade */}
        <div
          className="
            absolute inset-x-0 bottom-0
            h-24
            pointer-events-none
            bg-gradient-to-t
            from-base-100/20
            to-transparent
          "
        />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-center">
          <div
            className="
              w-full
              px-6
              sm:px-10
              lg:px-16
              xl:px-24
              2xl:px-32
            "
          >
            <HeroSlogan />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
