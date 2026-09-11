import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiCheck,
  FiCreditCard,
  FiLock,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";

const DEFAULT_ITEMS = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: 85,
    unit: "kg",
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Fresh Broccoli",
    price: 140,
    unit: "kg",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Fresh Carrots",
    price: 110,
    unit: "kg",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=300&q=80",
  },
];

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("freshmart-cart");

      return savedCart ? JSON.parse(savedCart) : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  useEffect(() => {
    localStorage.setItem("freshmart-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const discount = Math.round(subtotal * 0.1);
  const delivery = 50;
  const total = subtotal - discount + delivery;

  const updateQuantity = (id, change) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + change),
            }
          : item
      )
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePayment = (e) => {
    e.preventDefault();

    alert(
      `Order placed successfully!\nTotal: ৳${total}\nPayment: ${paymentMethod}`
    );

    navigate("/customer/order-confirmation");
  };

  return (
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
              Freshmart / Cart / Checkout
            </p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Checkout
            </h1>
          </div>
        </div>

        <form onSubmit={handlePayment}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">

            {/* ================= LEFT ================= */}
            <div className="space-y-5">

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

                {/* PayPal */}
                <label
                  className={`mb-3 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "paypal"
                      ? "border-primary bg-primary-soft/40"
                      : "border-theme hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="radio radio-primary"
                    />

                    <span className="font-extrabold">PayPal</span>
                  </div>

                  <span className="text-lg font-extrabold text-info">
                    Pay
                  </span>
                </label>

                {/* Credit Card */}
                <div
                  className={`rounded-xl border p-4 transition ${
                    paymentMethod === "card"
                      ? "border-primary"
                      : "border-theme"
                  }`}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="radio radio-primary"
                    />

                    <span className="font-extrabold">Credit Card</span>

                    <div className="ml-auto hidden gap-1 sm:flex">
                      <span className="rounded border border-theme px-2 py-1 text-xs font-extrabold text-info">
                        VISA
                      </span>
                      <span className="rounded border border-theme px-2 py-1 text-xs font-extrabold">
                        MC
                      </span>
                      <span className="rounded border border-theme px-2 py-1 text-xs font-extrabold text-info">
                        AMEX
                      </span>
                    </div>
                  </label>

                  {paymentMethod === "card" && (
                    <div className="mt-5 space-y-4">

                      {/* Card number */}
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          Card Number
                        </label>

                        <div className="relative">
                          <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />

                          <input
                            required
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-xl border border-theme bg-base-100 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        {/* Expiry */}
                        <div>
                          <label className="mb-2 block text-sm font-bold">
                            Expiry Date
                          </label>

                          <input
                            required
                            type="text"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleChange}
                            placeholder="MM / YY"
                            className="w-full rounded-xl border border-theme bg-base-100 px-3 py-3 text-sm outline-none transition focus:border-primary"
                          />
                        </div>

                        {/* CVV */}
                        <div>
                          <label className="mb-2 block text-sm font-bold">
                            CVV / CVC
                          </label>

                          <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />

                            <input
                              required
                              type="password"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              placeholder="123"
                              className="w-full rounded-xl border border-theme bg-base-100 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cardholder */}
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          Cardholder Name
                        </label>

                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Cardholder Name"
                          className="w-full rounded-xl border border-theme bg-base-100 px-3 py-3 text-sm outline-none transition focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Now Pay Later */}
                <label
                  className={`mt-3 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "later"
                      ? "border-primary bg-primary-soft/40"
                      : "border-theme hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="later"
                      checked={paymentMethod === "later"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="radio radio-primary"
                    />

                    <span className="font-extrabold">
                      Buy Now, Pay Later
                    </span>
                  </div>

                  <span className="text-lg font-bold text-secondary">
                    BNPL
                  </span>
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

                    <span className="font-extrabold">
                      Cash on Delivery
                    </span>
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
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-base-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-extrabold">
                          {item.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-muted">
                          ৳{item.price} / {item.unit}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex h-7 items-center overflow-hidden rounded-lg border border-theme">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex h-full w-7 items-center justify-center hover:bg-primary-soft"
                            >
                              <FiMinus size={12} />
                            </button>

                            <span className="flex min-w-7 justify-center border-x border-theme text-xs font-bold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-full w-7 items-center justify-center hover:bg-primary-soft"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          <span className="text-sm font-extrabold">
                            ৳{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    placeholder="Enter code here"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                  />

                  <button
                    type="button"
                    className="bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover"
                  >
                    Apply
                  </button>
                </div>
              </section>

              {/* Summary */}
              <section className="rounded-2xl border border-theme bg-base-100 p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <FiCheck size={18} />
                  </div>

                  <h2 className="text-lg font-extrabold">
                    Summary
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-bold">৳{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">Tax</span>
                    <span className="font-bold">৳0</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">Delivery</span>
                    <span className="font-bold">৳{delivery}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">Discount</span>
                    <span className="font-bold text-success">
                      -৳{discount}
                    </span>
                  </div>
                </div>

                <div className="my-5 border-t border-theme" />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold">Total</span>

                  <span className="text-2xl font-extrabold text-primary">
                    ৳{total}
                  </span>
                </div>

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-extrabold text-white transition hover:bg-primary-hover active:bg-primary-active"
                >
                  <FiLock size={17} />
                  Pay ৳{total}
                </button>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;