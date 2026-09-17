import NotificationsPage from "../../components/notification/Notificationspage";
import {
  FARMER_ORDER_TYPES,
  FARMER_PRODUCT_TYPES,
  FARMER_REVIEW_TYPES,
} from "../../components/notification/notificationTypes";

// ADJUST THESE to your real farmer routes
const getFarmerNotificationLink = (notification) => {
  if (
    FARMER_PRODUCT_TYPES.includes(notification.type) &&
    notification.relatedProduct
  ) {
    return `/farmer/products/${notification.relatedProduct}`;
  }

  if (
    FARMER_REVIEW_TYPES.includes(notification.type) &&
    notification.relatedProduct
  ) {
    return `/farmer/reviews`;
  }

  if (
    FARMER_ORDER_TYPES.includes(notification.type) &&
    notification.relatedOrder
  ) {
    return `/farmer/orders/${notification.relatedOrder}`;
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