import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiArrowRight,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTag,
  FiTrash2,
} from "react-icons/fi";

const INITIAL_CART = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    category: "Fresh Vegetables",
    price: 85,
    unit: "kg",
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Fresh Broccoli",
    category: "Green Vegetables",
    price: 140,
    unit: "kg",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Fresh Carrots",
    category: "Root Vegetables",
    price: 110,
    unit: "kg",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=300&q=80",
  },
];

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("freshmart-cart");

      return savedCart ? JSON.parse(savedCart) : INITIAL_CART;
    } catch {
      return INITIAL_CART;
    }
  });

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    localStorage.setItem("freshmart-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal - discount + deliveryFee;

  const updateQuantity = (id, change) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (item.id !== id) return item;

          return {
            ...item,
            quantity: Math.max(1, item.quantity + change),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "FRESH10") {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
    }
  };

  const handleCheckout = () => {
    localStorage.setItem("freshmart-cart", JSON.stringify(cartItems));
    navigate("/customer/checkout");
  };

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
              Fresh vegetables, ready for your kitchen.
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

              {/* Select all */}
              <div className="flex items-center justify-between border-b border-theme-light px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-primary bg-primary text-white">
                    <FiCheck size={13} strokeWidth={3} />
                  </div>

                  <span className="text-sm font-bold sm:text-base">
                    Select All
                  </span>
                </div>

                <span className="text-sm text-muted">
                  {cartItems.length} products
                </span>
              </div>

              {/* Items */}
              <div>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 px-5 py-5 sm:px-6 ${
                      index !== cartItems.length - 1
                        ? "border-b border-theme-light"
                        : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="hidden pt-2 sm:block">
                      <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-primary bg-primary text-white">
                        <FiCheck size={13} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-base-200 sm:h-28 sm:w-28">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="pr-1">
                        <p className="text-xs font-semibold text-primary">
                          {item.category}
                        </p>

                        <h3 className="mt-0.5 text-base font-extrabold sm:text-lg">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-muted">
                          ৳{item.price} / {item.unit}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-extrabold">
                          ৳{item.price * item.quantity}
                        </p>

                        {/* Quantity */}
                        <div className="flex h-9 items-center overflow-hidden rounded-lg border border-theme bg-base-100">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-full w-9 items-center justify-center text-muted transition hover:bg-primary-soft hover:text-primary"
                            aria-label={`Decrease ${item.name}`}
                          >
                            <FiMinus size={14} />
                          </button>

                          <span className="flex min-w-10 items-center justify-center border-x border-theme px-2 text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-full w-9 items-center justify-center text-muted transition hover:bg-primary-soft hover:text-primary"
                            aria-label={`Increase ${item.name}`}
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="self-start rounded-lg p-2 text-error transition hover:bg-error-soft"
                      aria-label={`Remove ${item.name}`}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
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