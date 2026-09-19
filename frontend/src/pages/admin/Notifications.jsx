import Notificationspage from "../../components/notification/Notificationspage";
import {
  ADMIN_ORDER_TYPES,
  ADMIN_REVIEW_TYPES,
} from "../../components/notification/notificationTypes";

const getNotificationLink = (notification) => {
  if (ADMIN_ORDER_TYPES.includes(notification.type)) {
    return "/admin/orders";
  }
  if (ADMIN_REVIEW_TYPES.includes(notification.type)) {
    return "/admin/reviews";
  }
  return null;
};

const AdminNotifications = () => (
  <Notificationspage
    title="Notifications"
    emptyMessage="You have no notifications."
    getNotificationLink={getNotificationLink}
  />
);

export default AdminNotifications;