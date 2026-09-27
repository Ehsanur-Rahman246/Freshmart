import NotificationsPage from "../../components/Notificationspage";
import {
  FARMER_ORDER_TYPES,
  FARMER_PRODUCT_TYPES,
  FARMER_REVIEW_TYPES,
  MESSAGE_TYPES,
} from "../../utils/notificationTypes";

const getFarmerNotificationLink = (notification) => {
  if (MESSAGE_TYPES.includes(notification.type)) {
    return "/farmer/messages";
  }

  if (FARMER_PRODUCT_TYPES.includes(notification.type)) {
    return "/farmer/listings";
  }

  if (FARMER_REVIEW_TYPES.includes(notification.type)) {
    return "/farmer/reviews";
  }

  if (
    FARMER_ORDER_TYPES.includes(notification.type) &&
    notification.relatedOrder
  ) {
    return "/farmer/orders";
  }

  return null;
};

export default function FarmerNotifications() {
  return (
    <NotificationsPage
      title="Notifications"
      emptyMessage="You have no notifications."
      getNotificationLink={getFarmerNotificationLink}
    />
  );
}
