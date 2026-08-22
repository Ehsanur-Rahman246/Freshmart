import { FaCartShopping } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";

const CutomerNavbar = () => {
  return (
    <nav className="navbar bg-base-100 px-4 sm:px-6 lg:px-10 border-b border-theme-light">

      {/* Logo */}
      <div className="flex-1">
        <a
          href="/"
          className="text-2xl font-extrabold tracking-tight text-primary"
        >
          Fresh<span className="text-base-content">Mart</span>
        </a>
      </div>

      {/* Search Bar */}
    <div className="flex flex-1 min-w-0 justify-center px-2 lg:px-8">
    <label className="input w-full max-w-xl flex items-center gap-2 bg-base-300 border-transparent focus-within:bg-base-100 focus-within:border-primary focus-within:outline-none focus-within:shadow-none">
        <FaSearch className="h-5 w-5 shrink-0 text-primary" />

        <input
        type="search"
        placeholder="Search fresh products..."
        className="grow min-w-0 bg-transparent border-none outline-none focus:border-none focus:outline-none caret-primary"
        />
    </label>
    </div>

      {/* Actions */}
      <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">

        {/* Cart */}
        <button
          className="btn btn-ghost btn-circle text-2xl"
          aria-label="Cart"
        >
          <FaCartShopping className="text-primary-active" />
        </button>

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-circle text-2xl"
          aria-label="Notifications"
        >
          <IoNotifications className="text-primary-active" />
        </button>

        {/* Profile */}
        <button
          className="btn btn-ghost btn-circle text-2xl"
          aria-label="Profile"
        >
          <FaUserCircle className="text-primary-active" />
        </button>

        <div className="tooltip tooltip-bottom" data-tip="Profile">
        <button
          className="btn btn-ghost btn-circle text-2xl"
          aria-label="Menu"
        >
          <FiMenu className="text-primary-active" />
        </button>
        </div>

      </div>
    </nav>
  );
};

export default CutomerNavbar;