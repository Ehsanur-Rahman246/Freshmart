import { NavLink } from "react-router";
import { FiHome, FiShoppingBag, FiPackage, FiHeart, FiMessageSquare } from "react-icons/fi";

const Menu = ({setSidebarOpen}) => {
  const menuItems = [
        {
          name: "Home",
          path: "/customer",
          icon: FiHome,
          end: true,
        },
        {
          name: "Market",
          path: "/marketplace",
          icon: FiShoppingBag,
        },
        {
          name: "Orders",
          path: "/orders",
          icon: FiPackage,
        },
        {
          name: "Wishlist",
          path: "/wishlist",
          icon: FiHeart,
        },
        {
          name: "Messages",
          path: "/messages",
          icon: FiMessageSquare,
          badge: 3,
        },
  ];

  return(
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
                          <span className="flex-1">
                            {item.name}
                          </span>

                          {/* Badge */}
                          {item.badge && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
        </div>
  )
}

const Sidebar = ({ sidebarOpen, setSidebarOpen}) => {
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
        <Menu setSidebarOpen={setSidebarOpen}/>
      </aside>
    </div>
    </>
  );
};

export default Sidebar;