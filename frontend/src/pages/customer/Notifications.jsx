import NotificationsPage from "../../components/notification/Notificationspage";
import { CUSTOMER_ORDER_TYPES } from "../../components/notification/notificationTypes";

// ADJUST THIS to your real customer order-detail route
const getCustomerNotificationLink = (notification) => {
  if (
    CUSTOMER_ORDER_TYPES.includes(notification.type) &&
    notification.relatedOrder
  ) {
    return `/customer/orders/${notification.relatedOrder}`;
  }
  return null;
};

export default function CustomerNotifications() {
  return (
    <NotificationsPage
      title="Notifications"
      emptyMessage="You have no notifications."
      getNotificationLink={getCustomerNotificationLink}
    />
  );
}