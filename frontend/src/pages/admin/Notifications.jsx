import Notificationspage from "../../components/Notificationspage";
import {
  ADMIN_ORDER_TYPES,
  ADMIN_REVIEW_TYPES,
  ADMIN_COMPANY_SALE_TYPES,
  MESSAGE_TYPES,
} from "../../utils/notificationTypes";

const getNotificationLink = (notification) => {
  if (MESSAGE_TYPES.includes(notification.type)) {
    return "/admin/messages";
  }

  if (notification.type === "conversationReported") {
    return "/admin/messages";
  }

  if (ADMIN_ORDER_TYPES.includes(notification.type)) {
    return "/admin/orders";
  }

  if (ADMIN_REVIEW_TYPES.includes(notification.type)) {
    return "/admin/reviews";
  }

  if (ADMIN_COMPANY_SALE_TYPES.includes(notification.type)) {
    return "/admin/products";
  }

  if (notification.type === "newCustomerRegistered") {
    return "/admin/customers";
  }

  if (notification.type === "newFarmerRegistered") {
    return "/admin/farmers";
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
