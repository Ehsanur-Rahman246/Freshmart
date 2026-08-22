import { NavLink } from "react-router";
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiHeart,
  FiMessageSquare,
  FiMapPin,
  FiUser,
  FiHelpCircle,
  FiLogOut,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

function Sidebar({ mobileOpen, setMobileOpen }) {
  const menuItems = [
    {
      section: "MENU",
      items: [
        {
          name: "Home",
          path: "/",
          icon: FiHome,
          end: true,
        },
        {
          name: "Market",
          path: "/market",
          icon: FiShoppingBag,
        },
        {
          name: "Orders",
          path: "/orders",
          icon: FiPackage,
        },
        {
          name: "Track Order",
          path: "/track-order",
          icon: FiTruck,
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
      ],
    },
    {
      section: "ACCOUNT",
      items: [
        {
          name: "Addresses",
          path: "/addresses",
          icon: FiMapPin,
        },
        {
          name: "Profile",
          path: "/profile",
          icon: FiUser,
        },
      ],
    },
    {
      section: "SUPPORT",
      items: [
        {
          name: "Help & Support",
          path: "/help",
          icon: FiHelpCircle,
        },
      ],
    },
  ];

  return (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50
          flex w-[260px] flex-col
          border-l border-theme-light
          bg-white

          transition-transform duration-300 ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-theme-light px-6">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            {/* Logo Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <span className="text-xl">🌿</span>
            </div>

            {/* Logo Text */}
            <div className="leading-none">
              <h1 className="text-lg font-extrabold tracking-tight text-base-content">
                Fresh<span className="text-primary">Mart</span>
              </h1>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-light">
                Farmer's Marketplace
              </p>
            </div>
          </NavLink>

          {/* Close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary"
            aria-label="Close sidebar"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {menuItems.map((section) => (
            <div
              key={section.section}
              className="mb-7 last:mb-0"
            >
              {/* Section Title */}
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-light">
                {section.section}
              </p>

              {/* Menu Items */}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
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
                            <span className="absolute right-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-l-full bg-primary" />
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
          ))}
        </div>

        {/* User Card */}
        <div className="border-t border-theme-light p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-primary-soft p-3">

            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
              JD
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-base-content">
                John Doe
              </p>

              <p className="truncate text-xs text-muted-light">
                Customer
              </p>
            </div>

            <FiChevronDown
              size={16}
              className="text-muted-light"
            />
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => alert("Logout clicked")}
            className="
              group flex w-full items-center gap-3
              rounded-lg px-3.5 py-2.5
              text-sm font-semibold text-muted
              transition
              hover:bg-error-soft
              hover:text-error
            "
          >
            <span className="flex h-5 w-5 items-center justify-center">
              <FiLogOut
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;