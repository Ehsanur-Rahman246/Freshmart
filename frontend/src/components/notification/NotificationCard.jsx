import { FiCheck, FiTrash2 } from "react-icons/fi";
import { timeAgo } from "./timeAgo";

// Generic — works for any role. The caller decides what onNavigate does
// (build a link, mark-as-read only, etc.) via the getNotificationLink
// function passed into NotificationsPage.
const NotificationCard = ({
  notification,
  isHighlighted,
  cardRef,
  onRead,
  onDelete,
  onNavigate,
}) => (
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
    <button
      onClick={() => onNavigate(notification)}
      className="text-left flex-1 min-w-0"
    >
      <div className="flex items-center gap-2 mb-1">
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        )}
        <p className="font-bold text-sm">{notification.title}</p>
      </div>
      <p className="text-sm text-muted mb-1">{notification.message}</p>
      <p className="text-xs text-muted-light">
        {timeAgo(notification.createdAt)}
      </p>
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

export default NotificationCard;