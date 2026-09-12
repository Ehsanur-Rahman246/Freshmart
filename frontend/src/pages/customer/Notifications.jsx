import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheck, FiTrash2, FiCheckCircle, FiInbox } from "react-icons/fi";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../../api/notification";

// Only these types currently point somewhere (all order-related).
// productExpired / reviewReceived are farmer-side; no customer target yet.
const ORDER_RELATED_TYPES = [
  "orderPlaced", "orderAccepted", "orderRejected", "orderCancelled",
  "orderProcessing", "readyForPickup", "paymentRequired", "driverAssigned",
  "pickedUp", "toOriginCenter", "inTransit", "toDestinationCenter",
  "outForDelivery", "delivered", "paymentSuccess", "paymentFailed",
];

// ADJUST THIS to your real customer order-detail route
const getNotificationLink = (notification) => {
  if (ORDER_RELATED_TYPES.includes(notification.type) && notification.relatedOrder) {
    return `/customer/orders/${notification.relatedOrder}`;
  }
  return null;
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

const NotificationCard = ({ notification, isHighlighted, cardRef, onRead, onDelete, onNavigate }) => (
  <div
    ref={cardRef}
    className={`rounded-box border p-4 flex justify-between gap-4 transition-all duration-500
      ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/40 bg-primary-soft/40"
          : notification.isRead
            ? "border-theme-light bg-base-100"
            : "border-theme-light bg-secondary-soft/40"
      }`}
  >
    <button onClick={() => onNavigate(notification)} className="text-left flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        )}
        <p className="font-bold text-sm">{notification.title}</p>
      </div>
      <p className="text-sm text-muted mb-1">{notification.message}</p>
      <p className="text-xs text-muted-light">{timeAgo(notification.createdAt)}</p>
    </button>

    <div className="flex flex-col gap-1.5 items-end shrink-0">
      {!notification.isRead && (
        <button
          onClick={() => onRead(notification._id)}
          className="btn btn-ghost btn-xs btn-circle"
          title="Mark as read"
        >
          <FiCheck size={14} />
        </button>
      )}
      <button
        onClick={() => onDelete(notification._id)}
        className="btn btn-ghost btn-xs btn-circle text-error"
        title="Delete"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  </div>
);

export default function CustomerNotifications() {
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
        searchParams.delete("highlight");
        setSearchParams(searchParams, { replace: true });
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [highlightId, notifications]);

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
    if (!window.confirm("Delete all notifications? This cannot be undone.")) return;
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
    const link = getNotificationLink(notification);
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
            <h1 className="text-xl font-extrabold">Notifications</h1>
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
            <p>You have no notifications.</p>
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