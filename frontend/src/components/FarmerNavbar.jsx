import { useState } from "react";
import {
  FiCreditCard,
  FiPackage,
  FiLayers,
  FiMenu,
  FiHome,
  FiUser,
  FiStar,
  FiMessageSquare,
  FiLogOut,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getFarmerProfile } from "../api/farmer";
import { NavLink } from "react-router";
import useLogout from "../hooks/useLogout";
import NotificationBell from "./NotificationBell";
import { PiFarmLight } from "react-icons/pi";
import { BsShop } from "react-icons/bs";
import { useConversations } from "../hooks/useMessages";
import { useAnnouncements } from "../hooks/useAnnouncements";

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
    name: "Revenue",
    icon: FiCreditCard,
    path: "/farmer/revenue",
  },
  {
    name: "Farms",
    icon: PiFarmLight,
    path: "/farms",
  },
  {
    name: "Market",
    icon: BsShop,
    path: "/marketplace",
  },
];

const Menu = () => {
  return (
    <div className="flex items-center gap-2 max-lg:hidden">
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
    <div className="relative lg:hidden">
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
  const handleLogout = useLogout();
  const { data: conversations = [] } = useConversations();
  const { data: announcements = [] } = useAnnouncements();
  const unreadAnnouncements = announcements.filter((a) => !a.isRead).length;
  const unreadMessages =
    conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) +
    unreadAnnouncements;

  const { data: farmer } = useQuery({
    queryKey: ["farmerProfile"],
    queryFn: async () => (await getFarmerProfile()).data.farmer,
  });

  return (
    <div className="relative ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">
      {/* Menu Button */}
      <button
        type="button"
        className="btn btn-ghost btn-circle m-1 p-0 overflow-hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
      >
        {farmer?.profileImage?.url ? (
          <img
            src={farmer.profileImage.url}
            alt={farmer.user?.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <FiUser className="text-2xl" />
        )}
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
          <li key={"messages"}>
            <NavLink
              to={"/farmer/messages"}
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
                  <FiMessageSquare className="text-[17px]" />
                  <span className="flex-1">Messages</span>

                  {unreadMessages > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          </li>
          <li key={"reviews"}>
            <NavLink
              to={"/farmer/reviews"}
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
                  <FiStar className="text-[17px]" />
                  <span>Reviews</span>

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

const FarmerNavbar = () => {
  return (
    <nav className="navbar sticky top-0 border-b border-theme-light bg-base-100 px-4 sm:px-6 lg:px-10 z-30">
      {/* Logo */}
      <div className="flex flex-1 items-center align-middle">
        <a
          href="/farmer"
          onClick={(e) => {
            e.preventDefault();
            window.location.replace("/farmer");
          }}
          className="flex items-center"
        >
          <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-2" />
          <div className="logo max-sm:hidden">FreshMart</div>
        </a>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Desktop Menu */}
        <Menu />

        {/* Mobile Menu */}
        <MobileMenu />

        {/* Notifications */}
        <NotificationBell notificationsPath="/farmer/notifications" />

        {/* Profile */}
        <ProfileMenu />
      </div>
    </nav>
  );
};

export default FarmerNavbar;
