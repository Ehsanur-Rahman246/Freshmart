import { NavLink } from "react-router";
import {
  FiHome,
  FiShoppingCart,
  FiShoppingBag,
  FiPackage,
  FiHeart,
  FiBell,
  FiFileText,
  FiMessageSquare,
  FiLogOut,
} from "react-icons/fi";
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
      name: "Wishlist",
      path: "/customer/wishlist",
      icon: FiHeart,
    },
    {
      name: "Reviews",
      path: "/customer/reviews",
      icon: FiFileText,
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
    <div className="flex-1 overflow-y-auto px-4 py-6">
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

const BottomMenu = () => {
  const handleLogout = useLogout();
  return <div
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition-colors duration-200 text-base-content hover:bg-error/60 hover:text-error-content"
                onClick={handleLogout}
              >
                <FiLogOut className="text-[17px]" />
                <span>Log Out</span>
              </div>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed left-0 top-16 z-40 w-full h-[calc(100vh-4rem)]
        bg-overlay transition-opacity duration-300
        ${sidebarOpen ? "opacity-90" : "pointer-events-none opacity-0"}`}
      />
      <div
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-base-100
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <aside>
          <Menu setSidebarOpen={setSidebarOpen} />
          <BottomMenu/>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
