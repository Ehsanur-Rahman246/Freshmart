import { NavLink } from "react-router";
import {
  FiHome,
  FiPackage,
  FiTruck,
  FiShoppingBag,
  FiUsers,
  FiUserCheck,
  FiStar,
  FiBell,
  FiMessageSquare,
  FiVolume2,
  FiUser,
  FiLogOut,
  FiSidebar,
} from "react-icons/fi";
import { PiFarmLight } from "react-icons/pi";
import useLogout from "../hooks/useLogout";

const menuItems = [
  { name: "Home", path: "/admin", icon: FiHome, end: true },
  { name: "Orders", path: "/admin/orders", icon: FiPackage },
  { name: "Delivery", path: "/admin/live-deliveries", icon: FiTruck },
  { name: "Market", path: "/admin/products", icon: FiShoppingBag },
  { name: "Customers", path: "/admin/customers", icon: FiUsers },
  { name: "Farmers", path: "/admin/farmers", icon: FiUserCheck },
  { name: "Farms", path: "/farms", icon: PiFarmLight },
  { name: "Reviews", path: "/admin/reviews", icon: FiStar },
  { name: "Notifications", path: "/admin/notifications", icon: FiBell },
  { name: "Messages", path: "/admin/messages", icon: FiMessageSquare },
  { name: "Announcements", path: "/admin/announcements", icon: FiVolume2 },
];

const NavItem = ({ item, collapsed, onNavigate }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5
        text-sm font-semibold transition-all duration-200
        ${collapsed ? "justify-center" : ""}
        ${
          isActive
            ? "bg-primary-soft text-primary"
            : "text-muted hover:bg-primary-soft hover:text-primary"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute right-0 top-1/2 h-7 w-0.75 -translate-y-1/2 rounded-l-full bg-primary" />
          )}
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors
              ${isActive ? "text-primary" : "text-muted-light group-hover:text-primary"}`}
          >
            <Icon size={19} strokeWidth={2} />
          </span>
          {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
        </>
      )}
    </NavLink>
  );
};

const AdminSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const handleLogout = useLogout();

  const content = (collapsedState, onNavigate) => (
    <aside className="flex h-full flex-col">
      {/* Logo + collapse toggle */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-theme-light px-4
          ${collapsedState ? "justify-center" : "justify-between"}`}
      >
        {!collapsedState && (
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-2" />
            <div className="logo">FreshMart</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="btn btn-ghost btn-sm btn-circle max-lg:hidden"
          aria-label="Toggle sidebar"
        >
        <FiSidebar size={17}/>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            collapsed={collapsedState}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Bottom: profile + logout */}
      <div className="border-t border-theme-light px-3 py-4 space-y-1">
        <NavItem
          item={{ name: "Profile", path: "/admin/profile", icon: FiUser }}
          collapsed={collapsedState}
          onNavigate={onNavigate}
        />
        <button
          type="button"
          onClick={handleLogout}
          title={collapsedState ? "Log Out" : undefined}
          className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5
            text-sm font-semibold text-muted transition-all duration-200
            hover:bg-error/10 hover:text-error
            ${collapsedState ? "justify-center" : ""}`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-light transition-colors group-hover:text-error">
            <FiLogOut size={19} strokeWidth={2} />
          </span>
          {!collapsedState && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <div
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-base-100 border-r border-theme-light
          transition-all duration-300 z-40
          ${collapsed ? "w-20" : "w-64"}`}
      >
        {content(collapsed, undefined)}
      </div>

      {/* Mobile off-canvas drawer */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-overlay transition-opacity duration-300 lg:hidden
          ${mobileOpen ? "opacity-90" : "pointer-events-none opacity-0"}`}
      />
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-base-100
          transition-transform duration-300 lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {content(false, () => setMobileOpen(false))}
      </div>
    </>
  );
};

export default AdminSidebar;