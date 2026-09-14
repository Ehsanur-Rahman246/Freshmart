import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notification";

const MAX_PREVIEW = 8;

// `notificationsPath` is the full notifications page for whichever role
// renders this bell, e.g. "/customer/notifications", "/farmer/notifications",
// "/driver/notifications". Drop it in each role's navbar with its own path.
const NotificationBell = ({ notificationsPath = "/notifications" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await getMyNotifications()).data.notifications,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const preview = notifications.slice(0, MAX_PREVIEW);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const handleItemClick = async (notification) => {
    setIsOpen(false);
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        invalidate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      navigate(`${notificationsPath}?highlight=${notification._id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="btn btn-ghost btn-circle m-1"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <div className="indicator">
          <FiBell className="text-2xl text-primary fill-primary" />
          {unreadCount > 0 && (
            <span className="indicator-item badge badge-sm bg-error text-error-content border-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-theme-light bg-base-300 shadow-lg flex flex-col max-h-[28rem]">
          <div className="px-4 py-3 border-b border-theme-light flex items-center justify-between">
            <h4 className="font-bold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <span className="badge badge-xs bg-error-soft text-error border-none">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {preview.length === 0 && (
              <p className="text-sm text-muted text-center py-8">
                No notifications yet
              </p>
            )}

            {preview.map((notification) => (
              <button
                key={notification._id}
                onClick={() => handleItemClick(notification)}
                className={`w-full text-left px-4 py-3 border-b border-theme-light last:border-b-0 transition-colors
                  ${
                    notification.isRead
                      ? "hover:bg-base-200"
                      : "bg-primary-soft/40 hover:bg-primary-soft"
                  }`}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-theme-light">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="btn btn-ghost btn-sm w-full gap-2 disabled:opacity-50"
            >
              <FiCheckCircle size={14} /> Mark All as Read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;