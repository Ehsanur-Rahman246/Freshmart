import NotificationsPage from "../../components/notification/Notificationspage";
import {
  ADMIN_ORDER_TYPES,
  ADMIN_REVIEW_TYPES,
} from "../../components/notification/notificationTypes";

// ADJUST THESE to your real admin routes
const getAdminNotificationLink = (notification) => {
  if (
    ADMIN_REVIEW_TYPES.includes(notification.type) &&
    notification.relatedOrder
  ) {
    return `/admin/orders/${notification.relatedOrder}`;
  }

  if (
    ADMIN_ORDER_TYPES.includes(notification.type) &&
    notification.relatedOrder
  ) {
    return `/admin/orders/${notification.relatedOrder}`;
  }

  return null;
};

export default function AdminNotifications() {
  return (
    <NotificationsPage
      title="Notifications"
      emptyMessage="You have no notifications."
      getNotificationLink={getAdminNotificationLink}
    />
  );
}