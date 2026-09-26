import NotificationsPage from "../../components/Notificationspage";
import {
  CUSTOMER_ORDER_TYPES,
  MESSAGE_TYPES,
} from "../../utils/notificationTypes";

const getCustomerNotificationLink = (notification) => {
  if (MESSAGE_TYPES.includes(notification.type)) {
    return "/customer/messages";
  }

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
