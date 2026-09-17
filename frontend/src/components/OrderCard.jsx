import { FiMapPin, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router";
import { getStatusMeta } from "../utils/orderStatus";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length || 1) - 1;
  const image = firstItem?.product?.images?.[0]?.url;
  const statusMeta = getStatusMeta(order.status);

  const originLabel =
    order.delivery?.originZone?.label || order.farm?.location?.district;
  const destinationLabel =
    order.delivery?.destinationZone?.label || order.deliveryAddress?.district;

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-4 hover:shadow-md transition">
      {/* Top */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-xs text-muted-light">Order</p>
          <p className="text-sm font-bold">{order.orderNumber}</p>
        </div>

        <span className={`badge ${statusMeta.badge} badge-sm`}>
          {statusMeta.label}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted">
        <FiMapPin className="shrink-0" />
        <span className="truncate">{originLabel || "Farm"}</span>
        <span className="flex-1 border-t border-dashed border-theme" />
        <FiMapPin className="shrink-0" />
        <span className="truncate">{destinationLabel || "You"}</span>
      </div>

      {/* Product */}
      <div className="bg-base-200 rounded-field p-3 mt-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-field bg-base-100 flex items-center justify-center overflow-hidden shrink-0">
          {image ? (
            <img src={image} alt={firstItem?.name} className="w-full h-full object-cover" />
          ) : (
            <FiPackage className="text-muted-light text-xl" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{firstItem?.name}</p>
          {extraCount > 0 && (
            <p className="text-xs text-muted-light">and {extraCount} more</p>
          )}
          <p className="text-xs text-muted">৳{order.pricing?.itemsTotal}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-muted">
          {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}
        </span>

        <button
          onClick={() => navigate(`/customer/orders/${order._id}`)}
          className="btn btn-sm btn-outline"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default OrderCard;