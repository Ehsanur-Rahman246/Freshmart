import { useState, useEffect } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import Sidebar from "./Sidebar";
import { logout } from "../api/auth";
import { NavLink, useNavigate } from "react-router";

const SearchBar = () => {
  return (
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
              to={"/customer/profile"}
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
            <div
              className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition-colors duration-200 text-base-content hover:bg-error/60 hover:text-error-content"
              onClick={handleLogout}
            >
              <FiLogOut className="text-[17px]" />
              <span>Log Out</span>
            </div>
          </li>
        </ul>
      )}
    </div>
  );
};

const CutomerNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`navbar sticky top-0 z-55 px-4 sm:px-6 lg:px-10 transition-all duration-300 ease-in-out ${scrolled ? "bg-primary/30 backdrop-blur-md border-none bg-linear-to-b from-secondary-soft/70 via-secondary-soft/30 via-65% to-transparent" : "bg-base-100"}`}
      >
        <div className="tooltip tooltip-bottom" data-tip="Menu">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-circle text-2xl"
            aria-label="Menu"
          >
            <FiMenu className="text-primary" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-1 items-center align-middle">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-2" />
          <div className="logo max-sm:hidden">FreshMart</div>
        </div>

        {/* Actions */}
        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
          <div className="flex flex-1 max-sm:hidden">
            <SearchBar />
          </div>

          {/* Search Bar */}
          <button
            className="btn btn-ghost btn-circle text-2xl sm:hidden"
            aria-label="Cart"
            onClick={() => setSearchActive(!searchActive)}
          >
            <FaSearch className="text-primary" />
          </button>

          {/* Cart */}
          <div className="tooltip tooltip-bottom" data-tip="Cart">
            <button
              className="btn btn-ghost btn-circle text-2xl"
              aria-label="Cart"
            >
              <FaCartShopping className="text-primary" />
            </button>
          </div>

          {/* Notifications */}
          <div className="tooltip tooltip-bottom" data-tip="Notifications">
            <button
              className="btn btn-ghost btn-circle text-2xl"
              aria-label="Notifications"
            >
              <IoNotifications className="text-primary" />
            </button>
          </div>

          {/* Profile */}
          <div className="tooltip tooltip-bottom" data-tip="Profile">
            <ProfileMenu/>
          </div>
        </div>
      </nav>

      {searchActive && (
        <div className="navbar bg-base-100 px-4 sm:px-6 lg:px-10 border-b border-theme-light sm:hidden">
          <div className="flex flex-1 justify-center px-4">
            <SearchBar />
          </div>
        </div>
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </>
  );
};

export default CutomerNavbar;
