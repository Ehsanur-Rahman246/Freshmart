import {
  FiUser,
  FiTruck,
  FiCreditCard,
  FiPackage,
  FiClock,
  FiStar,
} from "react-icons/fi";
import {
  getStatusMeta,
  getActiveStepIndex,
  isTerminalFailure,
  DELIVERY_STEP_GROUPS,
} from "../utils/orderStatus";
import { useViewer } from "../hooks/useViewer";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getMyReviews,
  createProductReview,
  createFarmReview,
} from "../api/review";
import ReviewModal from "./ReviewModal";

const PRE_PROCESSING_STATUSES = [
  "pendingAcceptance",
  "orderPlaced",
  "paymentPending",
];
const CANCELLABLE_STATUSES = [
  "pendingAcceptance",
  "orderPlaced",
  "paymentPending",
  "processing",
  "readyForPickup",
  "pickedUp",
  "toOriginCenter",
  "inTransit",
  "toDestinationCenter",
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Section = ({ title, icon, children }) => (
  <div className="border border-theme-light rounded-box p-4">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <p className="text-sm font-bold">{title}</p>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <span className="text-muted-light">{label}</span>
    <span className="text-right font-medium">{value ?? "—"}</span>
  </div>
);

const DeliveryTimeline = ({ status }) => {
  if (isTerminalFailure(status)) {
    const meta = getStatusMeta(status);
    return (
      <div
        className={`alert ${
          status === "cancelled" ? "alert-error" : "alert-warning"
        }`}
      >
        <span>This order was {meta.label.toLowerCase()}.</span>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(status);

  return (
    <ul className="timeline timeline-vertical timeline-compact">
      {DELIVERY_STEP_GROUPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <li key={step.key}>
            {index > 0 && (
              <hr className={isDone || isCurrent ? "bg-primary" : ""} />
            )}

            <div className="timeline-middle">
              <div
                className={`w-3 h-3 rounded-full ${
                  isDone || isCurrent ? "bg-primary" : "bg-base-300"
                }`}
              />
            </div>

            <div className="timeline-end timeline-box">
              <p
                className={`text-sm ${
                  isCurrent ? "font-bold text-primary" : "font-medium"
                }`}
              >
                {step.label}
              </p>
            </div>

            {index < DELIVERY_STEP_GROUPS.length - 1 && (
              <hr className={isDone ? "bg-primary" : ""} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

const ReviewBlock = ({ review, label, onReview }) => {
  if (!review) {
    return (
      <button
        type="button"
        onClick={onReview}
        className="btn btn-xs btn-outline gap-1"
      >
        <FiStar size={12} /> {label}
      </button>
    );
  }

  return (
    <div className="bg-base-200 rounded-field p-2 text-xs">
      <span className="flex gap-0.5 text-secondary">
        {[1, 2, 3, 4, 5].map((n) => (
          <FiStar
            key={n}
            size={12}
            className={n <= review.rating ? "fill-current" : ""}
          />
        ))}
      </span>
      {review.comment && <p className="text-muted mt-1">{review.comment}</p>}
    </div>
  );
};

const OrderDetailContent = ({
  order,
  onCancel,
  isCancelling,
  onPayNow,
  isPayingNow,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  onUpdateStatus,
  isUpdatingStatus,
  onAdminCancelNoDriver,
  isAdminCancelling,
}) => {
  const statusMeta = getStatusMeta(order.status);
  const farmerName = order.farmer?.user?.name;
  const customerName = order.customer?.user?.name;
  const driver = order.delivery?.driver;
  const courier = order.delivery?.courier;
  const deliveryAddress = `${order.deliveryAddress?.address}, ${order.deliveryAddress?.village}, ${order.deliveryAddress?.upazila}, ${order.deliveryAddress?.district}`;
  const farmAddress = `${order.farm?.location?.village}, ${order.farm?.location?.upazila}, ${order.farm?.location?.district}`;
  const { role } = useViewer();
  const isCustomer = role === "customer";
  const isAdmin = role === "admin";
  const isFarmer = role === "farmer";
  const queryClient = useQueryClient();
  const [reviewTarget, setReviewTarget] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const canReview = isCustomer && order.status === "delivered";

  const { data: myReviews = [] } = useQuery({
    queryKey: ["reviews", "customer"],
    queryFn: async () => (await getMyReviews()).data.reviews,
    enabled: canReview,
  });

  const findProductReview = (productId) =>
    myReviews.find(
      (r) => r.order === order._id && r.product?._id === productId,
    );

  const farmReview = myReviews.find(
    (r) => r.order === order._id && r.farm?._id === order.farm?._id,
  );

  const handleReviewSubmit = async ({ rating, comment }) => {
    setSubmittingReview(true);
    try {
      const payload = { orderId: order._id, rating, comment };

      if (reviewTarget.kind === "product") {
        await createProductReview(reviewTarget.id, payload);
      } else {
        await createFarmReview(reviewTarget.id, payload);
      }

      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review submitted");
      setReviewTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const REFUND_PCT = {
    pickedUp: 70,
    toOriginCenter: 40,
    inTransit: 40,
    toDestinationCenter: 40,
  };

  const handleCancel = () => {
    const pct = REFUND_PCT[order.status];
    const msg = pct
      ? `Cancelling now refunds only ${pct}% of your payment. Continue?`
      : "Cancel this order?";
    if (window.confirm(msg)) onCancel(order._id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-light">Order</p>
          <h2 className="text-lg font-bold">{order.orderNumber}</h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className={`badge ${statusMeta.badge} flex`}>
            {statusMeta.label}
          </span>
          <div>
            {onCancel && CANCELLABLE_STATUSES.includes(order.status) && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="btn btn-error disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {isFarmer &&
              order.status === "pendingAcceptance" &&
              onAccept &&
              onReject && (
                <>
                  <button
                    type="button"
                    onClick={() => onAccept(order._id)}
                    disabled={isAccepting || isRejecting}
                    className="btn btn-sm bg-primary text-primary-content disabled:opacity-50"
                  >
                    {isAccepting ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt(
                        "Reason for rejecting (optional):",
                      );
                      if (reason === null) return; // user pressed Cancel
                      onReject(order._id, reason.trim());
                    }}
                    disabled={isAccepting || isRejecting}
                    className="btn btn-sm btn-error disabled:opacity-50"
                  >
                    {isRejecting ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}
            {isFarmer && order.status === "processing" && onUpdateStatus && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id)}
                disabled={isUpdatingStatus}
                className="btn btn-sm bg-primary text-primary-content disabled:opacity-50"
              >
                {isUpdatingStatus ? "Updating..." : "Mark Ready for Pickup"}
              </button>
            )}
            {isAdmin &&
              order.status === "readyForPickup" &&
              !order.isDemoOrder &&
              onAdminCancelNoDriver && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Cancel this order? The customer will be fully refunded since no driver was available.",
                      )
                    ) {
                      onAdminCancelNoDriver(order._id);
                    }
                  }}
                  disabled={isAdminCancelling}
                  className="btn btn-sm bg-error text-error-content disabled:opacity-50"
                >
                  {isAdminCancelling ? "Cancelling..." : "Cancel (No Driver)"}
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Items */}
      <Section title="Items" icon={<FiPackage />}>
        <div className="space-y-3">
          {order.items?.map((item) => {
            const productId = item.product?._id || item.product;

            return (
              <div key={item._id || item.name} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-field bg-base-200 flex items-center justify-center overflow-hidden shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiPackage className="text-muted-light" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-light">
                      {item.quantity} {item.unit} × ৳{item.price}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">৳{item.subtotal}</p>
                </div>

                {canReview && (
                  <ReviewBlock
                    review={findProductReview(productId)}
                    label="Review Product"
                    onReview={() =>
                      setReviewTarget({ kind: "product", id: productId })
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Farm / Farmer */}
      {(isAdmin || isCustomer) && order.farm && (
        <Section title="Farm" icon={<FiUser />}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-field bg-base-200 flex items-center justify-center overflow-hidden shrink-0">
              {order.farm?.images?.[0]?.url ? (
                <img
                  src={order.farm.images[0].url}
                  alt={order.farm.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiPackage className="text-muted-light" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {order.farm.name}
              </p>
            </div>
          </div>

          {farmerName && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                {order.farmer?.profileImage?.url ? (
                  <img
                    src={order.farmer.profileImage.url}
                    alt={farmerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(farmerName)
                )}
              </div>
              <p className="text-sm font-medium">{farmerName}</p>
            </div>
          )}
          {canReview && (
            <div className="mt-3">
              <ReviewBlock
                review={farmReview}
                label="Review Farm"
                onReview={() =>
                  setReviewTarget({ kind: "farm", id: order.farm._id })
                }
              />
            </div>
          )}
        </Section>
      )}

      {/* Customer */}
      {(isFarmer || isAdmin) && order.customer && (
        <Section title="Customer" icon={<FiUser />}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-xs font-semibold shrink-0">
              {order.customer?.profileImage?.url ? (
                <img
                  src={order.customer.profileImage.url}
                  alt={customerName || "Customer"}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(customerName)
              )}
            </div>
            <p className="text-sm font-medium">{customerName || "Customer"}</p>
          </div>
          <Row label="Address" value={deliveryAddress} />
          <Row label="Phone" value={order.deliveryAddress?.phone} />
        </Section>
      )}

      {/* Delivery */}
      <Section title="Delivery" icon={<FiTruck />}>
        <Row label="From" value={farmAddress} />
        <Row label="To" value={deliveryAddress} />
        <Row
          label="Estimated Delivery"
          value={
            order.delivery?.estimatedDeliveryAt &&
            new Date(order.delivery.estimatedDeliveryAt).toLocaleString()
          }
        />
        <Row label="Courier" value={courier?.name} />
        <Row
          label="Driver"
          value={
            driver?.name
              ? `${driver.name}${driver.phone ? ` · ${driver.phone}` : ""}`
              : "Not assigned yet"
          }
        />
      </Section>

      {/* Payment */}
      <Section title="Payment" icon={<FiCreditCard />}>
        <Row
          label="Method"
          value={
            order.payment?.method === "online" ? "Online" : "Cash on Delivery"
          }
        />
        <Row
          label="Status"
          value={
            {
              pending: "Pending",
              paid: "Paid",
              failed: "Failed",
              refunded: "Refunded",
            }[order.payment?.status]
          }
        />
        <Row label="Items Total" value={`৳${order.pricing?.itemsTotal}`} />
        <Row
          label="Delivery Charge"
          value={`৳${order.pricing?.deliveryCharge}`}
        />
        {order.pricing?.discount > 0 && (
          <Row label="Discount" value={`-৳${order.pricing.discount}`} />
        )}
        {order.pricing?.pointsRedeemed > 0 && (
          <Row
            label="Points Redeemed"
            value={`-৳${order.pricing.pointsRedeemed}`}
          />
        )}
        {order.pricing?.debtSettled > 0 && (
          <Row
            label="Previous Balance Due"
            value={`+৳${order.pricing.debtSettled}`}
          />
        )}
        <div className="border-t border-theme-light mt-2 pt-2">
          <Row label="Total" value={`৳${order.pricing?.total}`} />
        </div>
        {order.status === "cancelled" &&
          order.payment?.status === "refunded" && (
            <Row
              label={`Refunded (${order.refund?.percentage}%)`}
              value={`৳${order.refund?.amount} as points`}
            />
          )}
      </Section>

      {/* Timeline */}
      {isCustomer && (
        <Section title="Order Status" icon={<FiClock />}>
          {PRE_PROCESSING_STATUSES.includes(order.status) ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                {order.status === "pendingAcceptance"
                  ? "Waiting for the farmer to accept your order."
                  : order.status === "orderPlaced"
                    ? "The farmer has accepted your order. Payment opens once every farm has responded."
                    : "All farms have responded. Payment is needed before this order can be picked up."}
              </p>

              {order.status === "paymentPending" &&
                order.payment?.method === "online" &&
                onPayNow && (
                  <button
                    type="button"
                    onClick={() => onPayNow(order.orderGroup)}
                    disabled={isPayingNow}
                    className="btn btn-sm bg-primary text-primary-content"
                  >
                    {isPayingNow ? "Processing..." : "Pay Now"}
                  </button>
                )}
            </div>
          ) : (
            <DeliveryTimeline status={order.status} />
          )}
        </Section>
      )}
      {reviewTarget && (
        <ReviewModal
          title={
            reviewTarget.kind === "product"
              ? "Review this product"
              : "Review this farm"
          }
          submitting={submittingReview}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default OrderDetailContent;
