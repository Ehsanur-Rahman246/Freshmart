import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheckCircle, FiTrash2, FiInbox } from "react-icons/fi";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../../api/notification";
import NotificationCard from "./NotificationCard";

// Generic full-page notification list. Each role's page passes in its own
// `getNotificationLink` (which relatedOrder/relatedProduct types map to
// which route) plus optional copy. Everything else — fetch, read, delete,
// highlight/scroll-to on arrival from the bell — is shared.
export default function NotificationsPage({
  title = "Notifications",
  emptyMessage = "You have no notifications.",
  getNotificationLink,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const cardRefs = useRef({});

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await getMyNotifications()).data.notifications,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  useEffect(() => {
    if (highlightId && cardRefs.current[highlightId]) {
      cardRefs.current[highlightId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const timeout = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("highlight");
        setSearchParams(params, { replace: true });
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [highlightId, notifications, searchParams, setSearchParams]);

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      invalidate();
    } catch (err) {
      console.error(err);
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

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all notifications? This cannot be undone."))
      return;
    try {
      await deleteAllNotifications();
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        invalidate();
      } catch (err) {
        console.error(err);
      }
    }
    const link = getNotificationLink?.(notification);
    if (link) navigate(link);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FiBell className="text-2xl text-primary" />
            <h1 className="text-xl font-extrabold">{title}</h1>
            {unreadCount > 0 && (
              <span className="badge badge-sm bg-error-soft text-error border-none">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="btn btn-sm btn-outline gap-1 disabled:opacity-50"
            >
              <FiCheckCircle size={14} /> Mark All Read
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
              className="btn btn-sm bg-error text-error-content gap-1 disabled:opacity-50"
            >
              <FiTrash2 size={14} /> Delete All
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <FiInbox className="text-4xl mb-3" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                isHighlighted={notification._id === highlightId}
                cardRef={(el) => (cardRefs.current[notification._id] = el)}
                onRead={handleRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}