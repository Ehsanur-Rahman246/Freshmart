import { useState } from "react";
import { FiMenu, FiUser, FiLogOut, FiSidebar } from "react-icons/fi";
import { NavLink } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { checkAuth } from "../api/auth";
import useLogout from "../hooks/useLogout";
import NotificationBell from "./NotificationBell";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = useLogout();

  const { data: user } = useQuery({
    queryKey: ["viewer"],
    queryFn: async () => (await checkAuth()).data.user,
  });

  return (
    <div className="relative ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">
      <button
        type="button"
        className="btn btn-ghost btn-circle m-1 p-0 overflow-hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
      >
        {user?.name?.[0]?.toUpperCase() || <FiUser className="text-2xl" />}
      </button>

      {isOpen && (
        <ul className="absolute right-0 top-full z-2 mt-2 w-52 rounded-xl border border-theme-light bg-base-300 p-2 shadow-lg">
          <li>
            <NavLink
              to="/admin/profile"
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
              <FiUser className="text-[17px]" />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
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

const AdminNavbar = ({ onMenuClick, setCollapsed, mobileOpen }) => {
  return (
    <nav className="navbar sticky top-0 border-b border-theme-light bg-base-100 px-4 sm:px-6 z-50">
      <button
        type="button"
        onClick={onMenuClick}
        className="btn btn-ghost btn-circle text-2xl lg:hidden"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
      <FiMenu className="text-primary" />
      </button>

      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="btn btn-ghost btn-sm btn-circle ml-2 max-lg:hidden mr-4 text-primary"
        aria-label="Toggle sidebar"
      >
        <FiSidebar size={22} />
      </button>

      <div className="flex flex-1 items-center align-middle">
        <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.replace("/");
            }}
            className="flex items-center"
          >
            <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-2" />
            <div className="logo max-sm:hidden">FreshMart</div>
          </a>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <NotificationBell notificationsPath="/admin/notifications" />
        <ProfileMenu />
      </div>
    </nav>
  );
};

export default AdminNavbar;