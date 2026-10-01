import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import { getCart, updateCartItem } from "../../api/cart";
import { getCustomerProfile } from "../../api/customer";
import { getCheckoutPreview, createOrder } from "../../api/order";

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [addressId, setAddressId] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await getCart()).data.cart,
  });

  const { data: customer } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: async () => (await getCustomerProfile()).data.customer,
  });

  const addresses = useMemo(
    () => customer?.addresses || [],
    [customer?.addresses],
  );

  const selectedAddressId =
    addressId ?? addresses.find((a) => a.isDefault)?._id ?? addresses[0]?._id;

  const { data: preview } = useQuery({
    queryKey: [
      "checkoutPreview",
      selectedAddressId,
      pointsToRedeem,
      appliedPromo,
    ],
    queryFn: async () =>
      (
        await getCheckoutPreview({
          addressId: selectedAddressId,
          pointsToRedeem,
          promoCode: appliedPromo || undefined,
        })
      ).data.preview,
    enabled: Boolean(selectedAddressId) && cartItems.length > 0,
  });

  const subtotal = preview?.itemsTotal ?? 0;
  const discount = preview?.discountAmount ?? 0;
  const delivery = preview?.deliveryCharge ?? 0;
  const pointsAvailable = preview?.pointsAvailable ?? 0;
  const pointsRedeemed = preview?.pointsRedeemed ?? 0;
  const debtBalance = preview?.debtBalance ?? 0;
  const promoDiscount = preview?.promoDiscount ?? 0;
  const promoError = preview?.promoError ?? null;
  const total = preview?.total ?? 0;
  const previewIssues = preview?.issues ?? [];
  const canCheckout = preview ? preview.canCheckout !== false : false;

  const visibleItems = cartItems.slice(0, 3);
  const remainingCount = cartItems.length - visibleItems.length;

  const getEffectivePrice = (product) => {
    const discountPct = product.discountPercentage || 0;
    return Math.round(product.price * (1 - discountPct / 100) * 100) / 100;
  };

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      updateCartItem(productId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Could not update quantity",
      );
    },
  });

  const updateQuantity = (item, change) => {
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) return;

    if (newQuantity > item.product.stock) {
      toast.error("Requested quantity exceeds available stock");
      return;
    }

    updateQuantityMutation.mutate({
      productId: item.product._id,
      quantity: newQuantity,
    });
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate(`/customer/order-confirmation/${response.data.orderGroup}`, {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not place order");
      setShowConfirmModal(false);
    },
  });

  const handlePayment = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmAndPlaceOrder = () => {
    createOrderMutation.mutate({
      addressId: selectedAddressId,
      paymentMethod: paymentMethod === "cod" ? "cashOnDelivery" : "online",
      pointsToRedeem,
      promoCode: appliedPromo || undefined,
    });
  };

  return (
    <>
      <main className="min-h-screen bg-base-200/50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate("/customer/cart")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-theme bg-base-100 transition hover:border-primary hover:text-primary"
              aria-label="Back to cart"
            >
              <FiArrowLeft size={19} />
            </button>

            <div>
              <p className="text-sm font-semibold text-muted">
                Home / Cart / Checkout
              </p>
              <h1 className="text-2xl font-extrabold sm:text-3xl">Checkout</h1>
            </div>
          </div>

          <form onSubmit={handlePayment}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
              {/* ================= LEFT ================= */}
              <div className="space-y-5">
                {/* Delivery Address */}
                <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <FiMapPin size={20} />
                    </div>

                    <div>
                      <h2 className="text-xl font-extrabold">
                        Delivery Address
                      </h2>
                      <p className="text-sm text-muted">
                        Choose where this order should be delivered.
                      </p>
                    </div>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-sm text-muted">
                      No saved addresses yet. Add one from your profile.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <label
                          key={address._id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                            selectedAddressId === address._id
                              ? "border-primary bg-primary-soft/40"
                              : "border-theme hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryAddress"
                            value={address._id}
                            checked={selectedAddressId === address._id}
                            onChange={() => setAddressId(address._id)}
                            className="radio radio-primary mt-1"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold">
                                {address.label || "Address"}
                              </span>
                              {address.isDefault && (
                                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-muted">
                              {address.recipientName} · {address.phone}
                            </p>
                            <p className="text-sm text-muted">
                              {address.village}, {address.upazila},{" "}
                              {address.district}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </section>
                {/* Payment */}
                <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <FiCreditCard size={20} />
                    </div>

                    <div>
                      <h2 className="text-xl font-extrabold">
                        Select Payment Option
                      </h2>
                      <p className="text-sm text-muted">
                        Choose your preferred payment method.
                      </p>
                    </div>
                  </div>

                  {/* bKash */}
                  <label
                    className={`mb-3 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      paymentMethod === "bkash"
                        ? "border-primary bg-primary-soft/40"
                        : "border-theme hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="bkash"
                        checked={paymentMethod === "bkash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="radio radio-primary"
                      />

                      <span className="font-extrabold">bKash</span>
                    </div>

                    <div className="w-8 h-8">
                      <img src="/bkash-logo.png" alt="bkash" />
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`mt-3 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary-soft/40"
                        : "border-theme hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="radio radio-primary"
                      />

                      <span className="font-extrabold">Cash on Delivery</span>
                    </div>

                    <FiTruck className="text-success" size={22} />
                  </label>

                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-xs font-semibold text-muted">
                    <FiLock className="shrink-0 text-primary" />
                    Your payment information is secure and encrypted.
                  </div>
                </section>
              </div>

              {/* ================= RIGHT ================= */}
              <aside className="h-fit space-y-5 lg:sticky lg:top-24">
                {/* Cart */}
                <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">
                      Your Cart ({cartItems.length})
                    </h2>

                    <FiShoppingBag className="text-primary" size={21} />
                  </div>
                  <div className="space-y-4">
                    {visibleItems.map((item) => {
                      const product = item.product;
                      if (!product) return null;

                      const effectivePrice = getEffectivePrice(product);

                      return (
                        <div key={item._id} className="flex gap-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-base-200">
                            <img
                              src={product.images?.[0]?.url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-extrabold">
                              {product.name}
                            </h3>

                            <p className="mt-0.5 text-xs text-muted">
                              ৳{effectivePrice} / {product.unit}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex h-7 items-center overflow-hidden rounded-lg border border-theme">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item, -1)}
                                  disabled={updateQuantityMutation.isPending}
                                  className="flex h-full w-7 items-center justify-center hover:bg-primary-soft"
                                >
                                  <FiMinus size={12} />
                                </button>

                                <span className="flex min-w-7 justify-center border-x border-theme text-xs font-bold">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item, 1)}
                                  disabled={updateQuantityMutation.isPending}
                                  className="flex h-full w-7 items-center justify-center hover:bg-primary-soft"
                                >
                                  <FiPlus size={12} />
                                </button>
                              </div>

                              <span className="text-sm font-extrabold">
                                ৳
                                {Math.round(
                                  effectivePrice * item.quantity * 100,
                                ) / 100}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {remainingCount > 0 && (
                      <p className="mt-3 text-center text-xs font-bold text-muted">
                        +{remainingCount} more item
                        {remainingCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </section>

                {/* Promo */}
                <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                  <h2 className="mb-3 text-base font-extrabold">
                    Promo Code or Gift Card
                  </h2>

                  <div className="flex overflow-hidden rounded-xl border border-theme">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code here"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAppliedPromo(promoCode.trim())}
                      disabled={!promoCode.trim()}
                      className="bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-2 text-xs font-bold text-error">
                      {promoError}
                    </p>
                  )}
                  {appliedPromo && promoDiscount > 0 && !promoError && (
                    <p className="mt-2 text-xs font-bold text-success">
                      "{appliedPromo}" applied — ৳{promoDiscount} off
                    </p>
                  )}
                </section>

                {/* Redeem Points */}
                <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-extrabold">Redeem Points</h2>
                    <span className="text-xs font-bold text-muted">
                      {pointsAvailable} available
                    </span>
                  </div>

                  <div className="flex overflow-hidden rounded-xl border border-theme">
                    <input
                      type="number"
                      min="0"
                      max={pointsAvailable}
                      value={pointsToRedeem}
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          Math.min(
                            Number(e.target.value) || 0,
                            pointsAvailable,
                          ),
                        );
                        setPointsToRedeem(value);
                      }}
                      placeholder="0"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setPointsToRedeem(pointsAvailable)}
                      className="bg-primary-soft px-5 text-sm font-bold text-primary hover:bg-primary/20"
                    >
                      Max
                    </button>
                  </div>

                  {pointsRedeemed > 0 && (
                    <p className="mt-2 text-xs font-bold text-success">
                      ৳{pointsRedeemed} will be deducted from your total.
                    </p>
                  )}
                </section>

                {/* Summary */}
                <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <FiCheck size={18} />
                    </div>

                    <h2 className="text-lg font-extrabold">Summary</h2>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-bold">৳{subtotal}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Discount</span>
                      <span className="font-bold text-success">
                        {discount > 0 ? `-৳${discount}` : "৳0"}
                      </span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Promo Discount</span>
                        <span className="font-bold text-success">
                          -৳{promoDiscount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted">Delivery</span>
                      <span className="font-bold">৳{delivery}</span>
                    </div>

                    {pointsRedeemed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Points Redeemed</span>
                        <span className="font-bold text-success">
                          -৳{pointsRedeemed}
                        </span>
                      </div>
                    )}

                    {debtBalance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Previous Balance Due</span>
                        <span className="font-bold text-error">
                          +৳{debtBalance}
                        </span>
                      </div>
                    )}
                  </div>

                  {previewIssues.length > 0 && (
                    <div className="mt-4 rounded-xl bg-error-soft p-3 text-sm text-error space-y-1">
                      {previewIssues.map((msg, i) => (
                        <p key={i}>{msg}</p>
                      ))}
                      <p className="font-bold">
                        Fix these in your cart before placing the order.
                      </p>
                    </div>
                  )}

                  <div className="my-5 border-t border-theme" />

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold">Total</span>

                    <span className="text-2xl font-extrabold text-primary">
                      ৳{total}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedAddressId || !preview || !canCheckout}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiLock size={17} />
                    {!preview
                      ? "Calculating..."
                      : !canCheckout
                        ? "Resolve cart issues to continue"
                        : `Place Order · ৳${total}`}
                  </button>
                </section>
              </aside>
            </div>
          </form>
        </div>
      </main>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4">
          <div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-xl">
            <h3 className="text-lg font-extrabold">Confirm Your Order</h3>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-bold">
                  {paymentMethod === "cod" ? "Cash on Delivery" : "bKash"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Items</span>
                <span className="font-bold">{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className="font-bold">৳{delivery}</span>
              </div>
              {pointsRedeemed > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Points Redeemed</span>
                  <span className="font-bold text-success">
                    -৳{pointsRedeemed}
                  </span>
                </div>
              )}
              {debtBalance > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Previous Balance Due</span>
                  <span className="font-bold text-error">+৳{debtBalance}</span>
                </div>
              )}
            </div>

            {paymentMethod !== "cod" && (
              <p className="mt-3 text-xs text-muted">
                You'll pay once every farm has accepted your order.
              </p>
            )}

            <div className="my-4 border-t border-theme" />

            <div className="flex items-center justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold text-primary">
                ৳{total}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={createOrderMutation.isPending}
                className="flex-1 rounded-xl border border-theme py-3 font-bold hover:bg-base-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndPlaceOrder}
                disabled={createOrderMutation.isPending}
                className="flex-1 rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary-hover disabled:opacity-60"
              >
                {createOrderMutation.isPending
                  ? "Placing..."
                  : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
