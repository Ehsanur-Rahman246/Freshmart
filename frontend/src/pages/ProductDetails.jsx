import { useState } from "react";
import {
  FiHeart,
  FiShare2,
  FiMinus,
  FiPlus,
  FiChevronRight,
  FiMapPin,
  FiStar,
  FiShield,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiShoppingCart,
} from "react-icons/fi";

const productImages = [
  {
    id: 1,
    className: "bg-gradient-to-br from-red-400 via-orange-500 to-red-700",
  },
  {
    id: 2,
    className: "bg-gradient-to-br from-green-300 via-green-600 to-emerald-800",
  },
  {
    id: 3,
    className: "bg-gradient-to-br from-orange-300 via-red-500 to-rose-800",
  },
  {
    id: 4,
    className: "bg-gradient-to-br from-red-300 via-red-600 to-orange-700",
  },
];

const features = [
  {
    icon: FiCheckCircle,
    label: "100% Organic",
  },
  {
    icon: FiShield,
    label: "Pesticide Free",
  },
  {
    icon: FiCheckCircle,
    label: "Freshly Picked",
  },
];

const ProductDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  return (
    <main className="min-h-screen bg-base-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Product section */}
        <section className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
            {/* Image gallery */}
            <div className="min-w-0">
              <div className="relative overflow-hidden rounded-2xl border border-base-300">
                <div
                  className={`aspect-square w-full transition-all duration-300 ${productImages[selectedImage].className}`}
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="rounded-full bg-white/15 px-8 py-5 text-center text-white backdrop-blur-sm">
                      <div className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                        TOMATO
                      </div>
                      <div className="mt-1 text-sm font-medium uppercase tracking-[0.25em] opacity-90">
                        Fresh Produce
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFavorite((current) => !current)}
                  aria-label={
                    isFavorite
                      ? "Remove product from favorites"
                      : "Add product to favorites"
                  }
                  className={`btn btn-circle absolute right-4 top-4 border-0 bg-base-100 shadow-md hover:bg-base-100 ${
                    isFavorite ? "text-error" : "text-base-content"
                  }`}
                >
                  <FiHeart
                    className="text-xl"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="mt-3 flex items-center gap-2 sm:gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-4 gap-2">
                  {productImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View product image ${index + 1}`}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <div
                        className={`h-full w-full ${image.className}`}
                      >
                        <div className="flex h-full items-center justify-center text-[9px] font-bold uppercase text-white/90 sm:text-xs">
                          Tomato
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Next product image"
                  onClick={() =>
                    setSelectedImage(
                      (current) => (current + 1) % productImages.length
                    )
                  }
                  className="btn btn-circle btn-sm shrink-0 border-base-300 bg-base-100"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>

            {/* Product information */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl">
                    Fresh Tomatoes
                  </h1>

                  <p className="mt-1 text-sm text-base-content/70">
                    by{" "}
                    <span className="font-semibold text-base-content">
                      Green Valley Farm
                    </span>
                    <span
                      className="ml-1 inline-flex align-middle text-primary"
                      title="Verified farmer"
                    >
                      <FiCheckCircle className="text-sm" />
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFavorite((current) => !current)}
                  aria-label={
                    isFavorite
                      ? "Remove product from favorites"
                      : "Add product to favorites"
                  }
                  className={`btn btn-circle btn-sm shrink-0 border-base-300 bg-base-100 ${
                    isFavorite ? "text-error" : ""
                  }`}
                >
                  <FiHeart
                    className="text-lg"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 font-bold">
                  <FiStar className="fill-warning text-warning" />
                  4.8
                </span>
                <span className="text-base-content/60">(120 reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-primary sm:text-4xl">
                  ৳ 40
                </span>
                <span className="ml-1 text-sm font-semibold text-base-content/60">
                  / kg
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 max-w-xl text-sm leading-6 text-base-content/70">
                Naturally grown tomatoes. No harmful chemicals used. Best for
                your family&apos;s health.
              </p>

              {/* Product features */}
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {features.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-xs font-semibold text-base-content/70"
                  >
                    <Icon className="text-primary" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="my-6 h-px bg-base-300" />

              {/* Quantity */}
              <div>
                <p className="mb-2 text-sm font-bold">Quantity</p>

                <div className="flex w-fit items-center overflow-hidden rounded-lg border border-base-300">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    aria-label="Decrease quantity"
                    className="btn btn-ghost btn-square btn-sm rounded-none"
                  >
                    <FiMinus />
                  </button>

                  <span className="min-w-16 px-3 text-center text-sm font-bold">
                    {quantity} kg
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                    className="btn btn-ghost btn-square btn-sm rounded-none"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="btn btn-primary flex-1 rounded-lg font-bold shadow-sm"
                >
                  <FiShoppingCart className="text-lg" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  aria-label="Add product to favorites"
                  onClick={() => setIsFavorite((current) => !current)}
                  className={`btn btn-square rounded-lg border-base-300 bg-base-100 ${
                    isFavorite ? "text-error" : ""
                  }`}
                >
                  <FiHeart
                    className="text-xl"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>

                <button
                  type="button"
                  aria-label="Share product"
                  className="btn btn-square rounded-lg border-base-300 bg-base-100"
                >
                  <FiShare2 className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Farmer information */}
        <section className="mt-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-extrabold text-base-content sm:text-base">
            Farmer Information
          </h2>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Placeholder for farmer photo */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-300 via-stone-500 to-stone-700 text-lg font-extrabold text-white ring-2 ring-base-200">
                GV
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base-content">
                    Green Valley Farm
                  </h3>
                  <FiCheckCircle
                    className="text-sm text-primary"
                    title="Verified farmer"
                  />
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="text-primary" />
                    Rajshahi, Bangladesh
                  </span>

                  <span className="flex items-center gap-1">
                    <FiStar className="fill-warning text-warning" />
                    <strong className="text-base-content/80">4.9</strong>
                    (230 reviews)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm w-full rounded-lg border-base-300 sm:w-auto sm:px-6"
            >
              View Farm
            </button>
          </div>
        </section>

        {/* Small reassurance row */}
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiShield className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content">
                  Secure Payment
                </p>
                <p className="mt-0.5 text-[11px] text-base-content/60">
                  100% secure checkout
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiTruck className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content">
                  Fast Delivery
                </p>
                <p className="mt-0.5 text-[11px] text-base-content/60">
                  2–3 days
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiClock className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content">
                  Easy Returns
                </p>
                <p className="mt-0.5 text-[11px] text-base-content/60">
                  7 days return
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;
