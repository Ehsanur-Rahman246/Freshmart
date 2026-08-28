import { FiCreditCard, FiPackage, FiShoppingBag, FiMenu, FiHome } from "react-icons/fi";
import { IoNotifications } from "react-icons/io5";

const SellerNavbar = ({ onListingsClick, onOrdersClick }) => {

  return (
    <nav className="navbar bg-base-100 px-4 sm:px-6 lg:px-10 border-b border-theme-light">

      {/* Logo */}
      <div className="logo flex-1">FreshMart</div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        <div  className="flex items-center gap-2 max-sm:hidden">
            {/* Home */}
            <button
            type="button"
            onClick={onListingsClick}
            className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
            >
            <FiHome size={16} />Home
            </button>

            {/* Listings */}
            <button
            type="button"
            onClick={onListingsClick}
            className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
            >
            <FiPackage size={16} />Listings
            </button>

            {/* Orders */}
            <button
            type="button"
            onClick={onOrdersClick}
            className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
            >
            <FiShoppingBag size={16} />Orders
            </button>

            {/* Payouts */}
            <button
            type="button"
            className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
            >
            <FiCreditCard size={16} />Payouts
            </button>
        </div>

        {/* Menu */}
        <div className="dropdown dropdown-bottom dropdown-end sm:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-2xl m-1"><FiMenu className="text-primary-active"/></div>
            <ul tabIndex={-1} className="dropdown-content menu bg-base-300 rounded-box z-2 w-52 p-2 shadow-sm">
                <li><a><FiHome size={16} />Home</a></li>
                <li><a><FiPackage size={16} />Listings</a></li>
                <li><a><FiShoppingBag size={16} />Orders</a></li>
                <li><a><FiCreditCard size={16} />Payouts</a></li>
            </ul>
        </div>

        {/* Notifications */}
        <div className="">
            <button
                className="btn btn-ghost btn-circle text-2xl"
                aria-label="Notifications"
            >
                <IoNotifications className="text-primary" />
            </button>
        </div>

        {/* Profile */}
        <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">
          FG
        </div>

      </div>
    </nav>
  );
};

export default SellerNavbar;