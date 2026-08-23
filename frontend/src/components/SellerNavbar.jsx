import { FiCreditCard, FiPackage, FiShoppingBag } from "react-icons/fi";

const SellerNavbar = ({ onListingsClick, onOrdersClick }) => {

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

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Listings */}
        <button
          type="button"
          onClick={onListingsClick}
          className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
        >
          <FiPackage size={16} />
          Listings
        </button>

        {/* Orders */}
        <button
          type="button"
          onClick={onOrdersClick}
          className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
        >
          <FiShoppingBag size={16} />
          Orders
        </button>

        {/* Payouts */}
        <button
          type="button"
          className="btn btn-sm border-theme bg-base-200 text-base-content hover:border-primary hover:bg-primary-soft"
        >
          <FiCreditCard size={16} />
          Payouts
        </button>

        {/* Profile */}
        <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">
          GF
        </div>

      </div>
    </nav>
  );
};

export default SellerNavbar;