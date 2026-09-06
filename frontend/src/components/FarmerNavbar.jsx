import { useState } from "react";
import {
  FiCreditCard,
  FiPackage,
  FiLayers,
  FiMenu,
  FiHome,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { IoNotifications } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router";
import { logout } from "../lib/auth";

const menuItems = [
  {
    name: "Home",
    icon: FiHome,
    path: "/farmer",
  },
  {
    name: "Listings",
    icon: FiLayers,
    path: "/farmer/listings",
  },
  {
    name: "Orders",
    icon: FiPackage,
    path: "/farmer/orders",
  },
  {
    name: "Payouts",
    icon: FiCreditCard,
    path: "/farmer/revenue",
  },
];

const Menu = () => {
  return (
    <div className="flex items-center gap-2 max-sm:hidden">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/farmer"}
            className={({ isActive }) =>
              `btn btn-sm gap-2 border-theme bg-base-200 text-base-content
              transition-all duration-200
              hover:hover:bg-primary-soft hover:text-primary
              ${
                isActive
                  ? "border-primary-active! bg-primary-soft text-primary-active!"
                  : ""
              }`
            }
          >
            <Icon size={16} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      {/* Menu Button */}
      <button
        type="button"
        className="btn btn-ghost btn-circle m-1 text-2xl"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
      >
        <FiMenu className="text-primary-active" />
      </button>

      {/* Menu */}
      {isOpen && (
        <ul className="absolute right-0 top-full z-2 mt-2 w-52 rounded-xl border border-theme-light bg-base-300 p-2 shadow-lg">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === "/farmer"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold
                    transition-colors duration-200
                    ${
                      isActive
                        ? "bg-primary-soft text-primary-active"
                        : "text-base-content hover:bg-primary-soft hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} />
                      <span>{item.name}</span>

                      {isActive && (
                        <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">
      {/* Menu Button */}
      <button
        type="button"
        className="btn btn-ghost btn-circle m-1 text-2xl"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
      >
        <FiUser className="text-2xl" />
      </button>

      {/* Menu */}
      {isOpen && (
        <ul className="absolute right-0 top-full z-2 mt-2 w-52 rounded-xl border border-theme-light bg-base-300 p-2 shadow-lg">
          <li key={"profile"}>
            <NavLink
              to={"/farmer/profile"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold
                  transition-colors duration-200 mb-2
                  ${
                    isActive
                      ? "bg-primary-soft text-primary-active"
                      : "text-base-content hover:bg-primary-soft hover:text-primary"
                  }`
              }
            >
              {({ isActive }) => (
                <>
                  <FiUser className="text-[17px]" />
                  <span>Profile</span>

                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          </li>
          <li key={"logout"}>
            <div className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition-colors duration-200 text-base-content hover:bg-error/60 hover:text-error-content" onClick={handleLogout}>
              <FiLogOut className="text-[17px]" />
              <span>Log Out</span>
            </div>
          </li>
        </ul>
      )}
    </div>
  );
};

const FarmerNavbar = () => {
  return (
    <nav className="navbar border-b border-theme-light bg-base-100 px-4 sm:px-6 lg:px-10">
      {/* Logo */}
      <div className="flex flex-1 items-center align-middle">
        <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-2" />
        <div className="logo max-sm:hidden">FreshMart</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Desktop Menu */}
        <Menu />

        {/* Mobile Menu */}
        <MobileMenu />

        {/* Notifications */}
        <Link
          to="/farmer/notifications"
          className="btn btn-ghost btn-circle text-2xl"
          aria-label="Notifications"
        >
          <IoNotifications className="text-primary" />
        </Link>

        {/* Profile */}
        <ProfileMenu />
      </div>
    </nav>
  );
};

export default FarmerNavbar;
