import { Link } from "react-router";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { PiXLogo } from "react-icons/pi";

const SocialLink = () => {
  return (
    <div className="grid grid-flow-col gap-1 sm:gap-2">
      <button
        className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary hover:border-transparent"
        aria-label="Facebook"
      >
        <FaFacebookF className="text-base sm:text-lg" />
      </button>

      <button
        className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary hover:border-transparent"
        aria-label="Instagram"
      >
        <FaInstagram className="text-base sm:text-lg" />
      </button>

      <button
        className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary hover:border-transparent"
        aria-label="Twitter"
      >
        <PiXLogo className="text-base sm:text-lg" />
      </button>

      <button
        className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary hover:border-transparent"
        aria-label="Whatsapp"
      >
        <FaWhatsapp className="text-base sm:text-lg" />
      </button>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-content text-base-100 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <aside>
        <div className="flex flex-1 items-center align-middle"> 
          <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-2" />
          <div className="logo">FreshMart</div>
        </div>

        <p className="text-sm sm:text-base text-base-100/70">
          Fresh Roots, Fair Prices.
        </p>

        <nav className="lg:hidden">
          <SocialLink />
        </nav>
        <p className="text-[0.65rem] sm:text-xs text-base-100/70 text-center">
          &copy; 2026 Fresh Mart. All rights reserved.
        </p>
      </aside>

      <nav className="max-lg:hidden">
        <SocialLink />
      </nav>

      <nav className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
        <Link
          to="/farms"
          className="btn btn-ghost btn-sm text-base-100/80 hover:bg-base-100/10 hover:text-primary hover:border-transparent whitespace-nowrap"
        >
          Farms
        </Link>

        <Link
          to="/marketplace"
          className="btn btn-ghost btn-sm text-base-100/80 hover:bg-base-100/10 hover:text-primary hover:border-transparent whitespace-nowrap"
        >
          Market
        </Link>

        <Link
          to="/terms-and-conditions"
          className="btn btn-ghost btn-sm text-base-100/80 hover:bg-base-100/10 hover:text-primary hover:border-transparent whitespace-nowrap"
        >
          Terms & Conditions
        </Link>

        <Link
          to="/privacy-policy"
          className="btn btn-ghost btn-sm text-base-100/80 hover:bg-base-100/10 hover:text-primary hover:border-transparent whitespace-nowrap"
        >
          Privacy Policy
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
