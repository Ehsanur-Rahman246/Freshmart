import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import { getCart, updateCartItem, removeFromCart } from "../../api/cart";

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await getCart()).data.cart,
  });

  const cartItems = data ?? [];

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      updateCartItem(productId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not update quantity");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId) => removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not remove item");
    },
  });

  const getEffectivePrice = (product) => {
    const discountPct = product.discountPercentage || 0;
    return Math.round(product.price * (1 - discountPct / 100) * 100) / 100;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total;
      return total + getEffectivePrice(item.product) * item.quantity;
    }, 0);
  }, [cartItems]);

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal - discount + deliveryFee;

  const updateQuantity = (item, change) => {
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
      removeItemMutation.mutate(item.product._id);
      return;
    }

    if (newQuantity > item.product.stock) {
      toast.error("Requested quantity exceeds available stock");
      return;
    }

    updateQuantityMutation.mutate({
      productId: item.product._id,
      quantity: newQuantity,
    });
  };

  const removeItem = (productId) => {
    removeItemMutation.mutate(productId);
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "FRESH10") {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
    }
  };

  const handleCheckout = () => {
    navigate("/customer/checkout");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-200/40 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center py-16 text-muted">
          Loading your cart...
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-base-200/40 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center py-16 text-error">
          Couldn't load your cart. Please try again.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-muted">
          <span>Home</span>
          <span>/</span>
          <span className="font-semibold text-base-content">Cart</span>
        </div>

        {/* Header */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your Cart
            </h1>
            <p className="mt-1 text-sm text-muted">
              Fresh groceries, farm to your door
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-bold text-primary sm:flex">
            <FiShoppingCart />
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-theme bg-base-100 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary">
              <FiShoppingCart />
            </div>

            <h2 className="text-2xl font-extrabold">Your cart is empty</h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Add some fresh vegetables from the marketplace and they will
              appear here.
            </p>

            <button
              onClick={() => navigate("/customer/marketplace")}
              className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-hover"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

            {/* ================= CART ITEMS ================= */}
            <section className="overflow-hidden rounded-2xl border border-theme bg-base-100 shadow-sm">

              <div className="flex items-center justify-between border-b border-theme-light px-5 py-4 sm:px-6">
                <span className="text-sm font-bold sm:text-base">
                  Items in Cart
                </span>

                <span className="text-sm text-muted">
                  {cartItems.length} products
                </span>
              </div>

              {/* Items */}
              <div>
                {cartItems.map((item, index) => {
                  const product = item.product;

                  if (!product) return null;

                  const effectivePrice = getEffectivePrice(product);

                  return (
                    <div
                      key={item._id}
                      className={`flex gap-4 px-5 py-5 sm:px-6 ${
                        index !== cartItems.length - 1
                          ? "border-b border-theme-light"
                          : ""
                      }`}
                    >
                      {/* Product Image */}
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-base-200 sm:h-28 sm:w-28">
                        <img
                          src={product.images?.[0]?.url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                        <div className="pr-1">
                          <p className="text-xs font-semibold text-primary">
                            {product.farm?.name}
                          </p>

                          <h3 className="mt-0.5 text-base font-extrabold sm:text-lg">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-sm text-muted">
                            ৳{effectivePrice} / {product.unit}
                          </p>

                          {product.status !== "active" && (
                            <p className="mt-1 text-xs font-bold text-error">
                              This item is no longer available
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-lg font-extrabold">
                            ৳{Math.round(effectivePrice * item.quantity * 100) / 100}
                          </p>

                          {/* Quantity */}
                          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-theme bg-base-100">
                            <button
                              onClick={() => updateQuantity(item, -1)}
                              disabled={updateQuantityMutation.isPending}
                              className="flex h-full w-9 items-center justify-center text-muted transition hover:bg-primary-soft hover:text-primary"
                              aria-label={`Decrease ${product.name}`}
                            >
                              <FiMinus size={14} />
                            </button>

                            <span className="flex min-w-10 items-center justify-center border-x border-theme px-2 text-sm font-bold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item, 1)}
                              disabled={updateQuantityMutation.isPending}
                              className="flex h-full w-9 items-center justify-center text-muted transition hover:bg-primary-soft hover:text-primary"
                              aria-label={`Increase ${product.name}`}
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(product._id)}
                        disabled={removeItemMutation.isPending}
                        className="self-start rounded-lg p-2 text-error transition hover:bg-error-soft"
                        aria-label={`Remove ${product.name}`}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping */}
              <div className="border-t border-theme-light px-5 py-4 sm:px-6">
                <button
                  onClick={() => navigate("/customer/marketplace")}
                  className="text-sm font-bold text-primary transition hover:text-primary-hover"
                >
                  ← Continue Shopping
                </button>
              </div>
            </section>

            {/* ================= ORDER SUMMARY ================= */}
            <aside className="max-lg:sticky max-lg:bottom-0 h-fit rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">

              <h2 className="text-xl font-extrabold">Order Summary</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-bold">৳{subtotal}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Discount</span>
                  <span className="font-bold text-error">
                    {discount > 0 ? `-৳${discount}` : "৳0"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Delivery Fee</span>
                  <span className="font-bold">৳{deliveryFee}</span>
                </div>
              </div>

              <div className="my-5 border-t border-theme-light" />

              <div className="flex items-center justify-between">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-extrabold text-primary">
                  ৳{total}
                </span>
              </div>

              {/* Promo */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold">
                  Promo Code
                </label>

                <div className="flex overflow-hidden rounded-xl border border-theme bg-base-100 focus-within:border-primary">
                  <div className="flex items-center pl-3 text-muted">
                    <FiTag size={17} />
                  </div>

                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                  />

                  <button
                    onClick={applyPromo}
                    className="bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover"
                  >
                    Apply
                  </button>
                </div>

                {promoApplied && (
                  <p className="mt-2 text-xs font-bold text-success">
                    FRESH10 applied — 10% discount added.
                  </p>
                )}

                {!promoApplied && promoCode && (
                  <p className="mt-2 text-xs text-error">
                    Try promo code: FRESH10
                  </p>
                )}
              </div>

              {/* Checkout */}
              <button
                onClick={handleCheckout}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3.5 font-extrabold text-white shadow-sm transition hover:bg-primary-hover active:bg-primary-active"
              >
                Go to Checkout
                <FiArrowRight size={18} />
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;