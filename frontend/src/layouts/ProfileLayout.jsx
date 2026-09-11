import { Outlet, NavLink, useLocation } from "react-router";
import {
  FiUser,
  FiMapPin,
  FiLock,
  FiBell,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";

const profileNavigation = [
  {
    label: "Profile",
    path: "",
    icon: FiUser,
  },
  {
    label: "Addresses",
    path: "addresses",
    icon: FiMapPin,
  },
  {
    label: "Notifications",
    path: "notifications",
    icon: FiBell,
  },
  {
    label: "Change Password",
    path: "change-password",
    icon: FiLock,
  },
];

const ProfileLayout = ({ user, onLogout }) => {
  const location = useLocation();

  const isProfileHome =
    location.pathname.endsWith("/profile") ||
    location.pathname.endsWith("/profile/");

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-1 text-sm font-bold text-primary">
            Account Settings
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-light sm:text-base">
            Manage your personal information, account settings, and preferences.
          </p>
        </div>

        {/* Profile Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-box border border-theme bg-base-200 p-3">
            {/* User Summary */}
            <div className="mb-3 rounded-field bg-primary-soft p-4">
              <div className="flex items-center gap-3">
                {/* Profile Image */}
                <div className="avatar">
                  <div className="w-12 rounded-full bg-base-300">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user?.name || "Profile"}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <FiUser size={22} />
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">
                    {user?.name || "User"}
                  </p>

                  <p className="truncate text-xs text-muted-light">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {profileNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === ""}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "text-muted hover:bg-base-300 hover:text-base-content"
                      }`
                    }
                  >
                    <Icon size={18} />

                    <span>{item.label}</span>

                    <FiChevronRight
                      size={16}
                      className="ml-auto opacity-60"
                    />
                  </NavLink>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="my-3 border-t border-theme" />

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-sm font-bold text-error transition-colors hover:bg-error-soft"
            >
              <FiLogOut size={18} />

              <span>Logout</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            {isProfileHome ? (
              <div className="space-y-6">
                <Outlet />
              </div>
            ) : (
              <div className="space-y-6">
                <Outlet />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;