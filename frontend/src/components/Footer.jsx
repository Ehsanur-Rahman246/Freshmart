import { NavLink } from "react-router";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-content text-base-100 p-10">

      {/* Logo */}
      <aside>
        <div className="text-2xl font-extrabold text-primary">
          Fresh Mart
        </div>

        <p className="text-base-100/70">
          Connecting farmers with fresh, local markets.
        </p>
      </aside>

      {/* Social Icons */}
      <nav>
        <div className="grid grid-flow-col gap-2">
          <button
            className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary"
            aria-label="Facebook"
          >
            <FaFacebookF className="text-lg" />
          </button>

          <button
            className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary"
            aria-label="Instagram"
          >
            <FaInstagram className="text-lg" />
          </button>

          <button
            className="btn btn-ghost btn-circle text-base-100 hover:bg-base-100/10 hover:text-primary"
            aria-label="Twitter"
          >
            <FaTwitter className="text-lg" />
          </button>
        </div>
      </nav>

      {/* Policies */}
      <nav className="flex flex-row gap-2">
        <NavLink
          to="/terms"
          className="btn btn-ghost btn-sm text-base-100/80 hover:bg-base-100/10 hover:text-primary"
        >
          Terms & Conditions
        </NavLink>

        <NavLink
          to="/privacy"
          className="btn btn-ghost btn-sm text-base-100/80 hover:bg-base-100/10 hover:text-primary"
        >
          Privacy Policy
        </NavLink>
      </nav>

      {/* Copyright */}
      <aside>
        <p className="text-sm text-base-100/60">
          © {new Date().getFullYear()} Fresh Mart. All rights reserved.
        </p>
      </aside>

    </footer>
  );
};

export default Footer;