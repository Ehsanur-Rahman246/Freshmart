import { NavLink } from "react-router";
import {
  FiHome,
  FiShoppingCart,
  FiShoppingBag,
  FiPackage,
  FiHeart,
  FiBell,
  FiStar,
  FiMessageSquare,
  FiLogOut,
  FiUser,
  FiBookOpen,
  FiShield,
  FiInfo,
  FiHelpCircle,
} from "react-icons/fi";
import { PiFarmLight } from "react-icons/pi";
import { useQuery } from "@tanstack/react-query";
import { getMyNotifications } from "../api/notification";
import useLogout from "../hooks/useLogout";

const Menu = ({ setSidebarOpen }) => {
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await getMyNotifications()).data.notifications,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const menuItems = [
    {
      name: "Home",
      path: "/customer",
      icon: FiHome,
      end: true,
    },
    {
      name: "Cart",
      path: "/customer/cart",
      icon: FiShoppingCart,
    },
    {
      name: "Market",
      path: "/customer/marketplace",
      icon: FiShoppingBag,
    },
    {
      name: "Orders",
      path: "/customer/orders",
      icon: FiPackage,
    },
    {
      name: "Farms",
      path: "/farms",
      icon: PiFarmLight,
    },
    {
      name: "Wishlist",
      path: "/customer/wishlist",
      icon: FiHeart,
    },
    {
      name: "Reviews",
      path: "/customer/reviews",
      icon: FiStar,
    },
    {
      name: "Messages",
      path: "/customer/messages",
      icon: FiMessageSquare,
      badge: 3,
    },
    {
      name: "Notifications",
      path: "/customer/notifications",
      icon: FiBell,
      badge: unreadCount,
    },
  ];

  return (
    <div className="px-4 py-6">
      {/* Menu Items */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `
                        group relative flex items-center
                        gap-3 rounded-lg px-3.5 py-2.5
                        text-sm font-semibold
                        transition-all duration-200

                        ${
                          isActive
                            ? "bg-primary-soft text-primary"
                            : "text-muted hover:bg-primary-soft hover:text-primary"
                        }
                        `
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
                  )}

                  {/* Icon */}
                  <span
                    className={`
                              flex h-5 w-5 shrink-0
                              items-center justify-center
                              transition-colors

                              ${
                                isActive
                                  ? "text-primary"
                                  : "text-muted-light group-hover:text-primary"
                              }
                            `}
                  >
                    <Icon size={19} strokeWidth={2} />
                  </span>

                  {/* Label */}
                  <span className="flex-1">{item.name}</span>

                  {/* Badge */}
                  {item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

const BottomMenu = ({ setSidebarOpen }) => {
  const handleLogout = useLogout();

  const appSupportItems = [
    {
      name: "Terms & Conditions",
      path: "/terms-and-conditions",
      icon: FiBookOpen,
    },
    {
      name: "Privacy Policy",
      path: "/privacy-policy",
      icon: FiShield,
    },
    {
      name: "About",
      path: "/about",
      icon: FiInfo,
    },
    {
      name: "Help",
      path: "/help",
      icon: FiHelpCircle,
    },
  ];

  return (
    <div className="px-4 pb-6">
      {/* App & Support */}
      <div className="mb-6">
        <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-light">
          App & Support
        </p>

        <nav className="space-y-1">
          {appSupportItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen?.(false)}
                className={({ isActive }) =>
                  `
                    group relative flex items-center
                    gap-3 rounded-lg px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200

                    ${
                      isActive
                        ? "bg-primary-soft text-primary"
                        : "text-muted hover:bg-primary-soft hover:text-primary"
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Indicator */}
                    {isActive && (
                      <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
                    )}

                    {/* Icon */}
                    <span
                      className={`
                        flex h-5 w-5 shrink-0
                        items-center justify-center
                        transition-colors

                        ${
                          isActive
                            ? "text-primary"
                            : "text-muted-light group-hover:text-primary"
                        }
                      `}
                    >
                      <Icon size={19} strokeWidth={2} />
                    </span>

                    <span className="flex-1">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Account */}
      <div>
        <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-light">
          Account
        </p>

        <nav className="space-y-1">
          {/* Profile */}
          <NavLink
            to="/customer/profile"
            onClick={() => setSidebarOpen?.(false)}
            className={({ isActive }) =>
              `
                group relative flex items-center
                gap-3 rounded-lg px-3.5 py-2.5
                text-sm font-semibold
                transition-all duration-200

                ${
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-primary-soft hover:text-primary"
                }
              `
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
                )}

                <span
                  className={`
                    flex h-5 w-5 shrink-0
                    items-center justify-center
                    transition-colors

                    ${
                      isActive
                        ? "text-primary"
                        : "text-muted-light group-hover:text-primary"
                    }
                  `}
                >
                  <FiUser size={19} strokeWidth={2} />
                </span>

                <span className="flex-1">Profile</span>
              </>
            )}
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              group flex w-full items-center
              gap-3 rounded-lg px-3.5 py-2.5
              text-sm font-semibold text-muted
              transition-all duration-200
              hover:bg-error/10 hover:text-error
            "
          >
            <span
              className="
                flex h-5 w-5 shrink-0
                items-center justify-center
                text-muted-light
                transition-colors
                group-hover:text-error
              "
            >
              <FiLogOut size={19} strokeWidth={2} />
            </span>

            <span>Log Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-full
        bg-overlay transition-opacity duration-300
        ${sidebarOpen ? "opacity-90" : "pointer-events-none opacity-0"}`}
      />

      <div
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64
        bg-base-100 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <aside className="flex h-full flex-col overflow-y-auto">
          <Menu setSidebarOpen={setSidebarOpen} />

          <BottomMenu setSidebarOpen={setSidebarOpen} />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
