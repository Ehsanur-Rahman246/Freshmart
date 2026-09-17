import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import CutomerNavbar from "../components/CustomerNavbar";
import FarmerNavbar from "../components/FarmerNavbar";
import AdminNavbar from "../components/AdminNavbar";
import HomeNavbar from "../components/HomeNavbar";
// add to imports at top of ProductDetails.jsx
import ProductCard from "../components/ProductCard";
import { getRelatedProducts } from "../api/product";
import {
  FiHeart,
  FiShare2,
  FiMinus,
  FiPlus,
  FiChevronRight,
  FiMapPin,
  FiStar,
  FiShield,
  FiCheckCircle,
  FiShoppingCart,
} from "react-icons/fi";
import { getProductById } from "../api/product";
import { getProductReviews, getFarmReviews } from "../api/review";
import { addToCart } from "../api/cart";
import {
  getCustomerProfile,
  addToWishlist,
  removeFromWishlist,
} from "../api/customer";
import { useViewer } from "../hooks/useViewer";

const features = [
  { icon: FiCheckCircle, label: "100% Organic" },
  { icon: FiShield, label: "Pesticide Free" },
  { icon: FiCheckCircle, label: "Freshly Picked" },
];

const FALLBACK_IMAGE_CLASS =
  "bg-gradient-to-br from-green-300 via-green-600 to-emerald-800";

// Repeats the product's own images to always fill 4 thumbnail slots.
const getDisplayImages = (images = []) => {
  if (!images || images.length === 0) return [];
  return Array.from({ length: 4 }, (_, i) => images[i % images.length]);
};

const ProductDetails = () => {
  const { productId } = useParams();
  const queryClient = useQueryClient();
  const { role } = useViewer();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isCustomer = role === "customer";
  const isGuest = role === "guest";
  const isAdmin = role === "admin";
  const isFarmer = role === "farmer";
  const showCustomerActions = isCustomer || isGuest; // farmer/admin never see cart/heart

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await getProductById(productId);
      return data.product;
    },
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: async () => {
      const { data } = await getProductReviews(productId);
      return data.reviews;
    },
    enabled: !!productId,
  });

  // add alongside the other useQuery calls
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["product", productId, "related"],
    queryFn: async () => {
      const { data } = await getRelatedProducts(productId);
      return data.products;
    },
    enabled: !!productId && showCustomerActions,
  });

  const { data: farmReviews = [] } = useQuery({
    queryKey: ["reviews", "farm", product?.farm?._id],
    queryFn: async () => {
      const { data } = await getFarmReviews(product.farm._id);
      return data.reviews;
    },
    enabled: !!product?.farm?._id,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["customer", "profile"],
    queryFn: async () => {
      const { data } = await getCustomerProfile();
      return data.customer.wishlist;
    },
    enabled: isCustomer,
  });

  const isFavorite = wishlist.some((item) => item._id === productId);

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart({ productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not add to cart");
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: () =>
      isFavorite ? removeFromWishlist(productId) : addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const handleAddToCart = () => {
    if (isGuest) {
      toast.error("Please login first");
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleFavorite = () => {
    if (isGuest) {
      toast.error("Please login first");
      return;
    }
    wishlistMutation.mutate();
  };

  const increaseQuantity = () => setQuantity((current) => current + 1);
  const decreaseQuantity = () =>
    setQuantity((current) => Math.max(1, current - 1));

  if (isLoading || !product) {
    return (
      <main className="min-h-screen bg-base-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="skeleton h-96 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  const displayImages = getDisplayImages(product.images);

  const effectivePrice =
    Math.round(
      product.price * (1 - (product.discountPercentage || 0) / 100) * 100,
    ) / 100;

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : "0";

  const farmAverageRating = farmReviews.length
    ? (
        farmReviews.reduce((sum, review) => sum + review.rating, 0) /
        farmReviews.length
      ).toFixed(1)
    : "0";

  return (
    <>
      <nav className="sticky top-0 z-30">
        {isCustomer && <CutomerNavbar />}
        {isGuest && <HomeNavbar />}
        {isAdmin && <AdminNavbar />}
        {isFarmer && <FarmerNavbar />}
      </nav>
      <main className="min-h-screen bg-base-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Product section */}
          <section className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-md sm:p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
              {/* Image gallery */}
              <div className="min-w-0">
                <div className="relative overflow-hidden rounded-2xl border border-base-300">
                  <div className="aspect-square w-full transition-all duration-300">
                    {displayImages[selectedImage] ? (
                      <img
                        src={displayImages[selectedImage].url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-full w-full ${FALLBACK_IMAGE_CLASS}`}
                      />
                    )}
                  </div>

                  {showCustomerActions && (
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      aria-label={
                        isFavorite
                          ? "Remove product from favorites"
                          : "Add product to favorites"
                      }
                      className={`btn btn-circle absolute right-4 top-4 border-0 bg-base-100 shadow-md hover:bg-base-300 ${
                        isFavorite ? "text-error" : "text-base-content"
                      }`}
                    >
                      <FiHeart
                        className="text-xl"
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </button>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="mt-3 flex items-center gap-2 sm:gap-3">
                  <div className="grid min-w-0 flex-1 grid-cols-4 gap-2">
                    {displayImages.map((image, index) => (
                      <button
                        key={`${image.publicId}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        aria-label={`View product image ${index + 1}`}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImage === index
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    aria-label="Next product image"
                    onClick={() =>
                      setSelectedImage(
                        (current) => (current + 1) % displayImages.length,
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
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl">
                    {product.name}
                  </h1>

                  <p className="mt-1 text-sm text-base-content/70">
                    by{" "}
                    <span className="font-semibold text-base-content">
                      {product.farm?.name}
                    </span>
                  </p>
                </div>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 font-bold">
                    <FiStar className="fill-secondary text-secondary" />
                    {averageRating || "0"}
                  </span>
                  <span className="text-base-content/60">
                    ({reviews.length} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-primary sm:text-4xl">
                    ৳ {effectivePrice}
                  </span>
                  <span className="ml-1 text-sm font-semibold text-base-content/60">
                    / {product.unit}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 max-w-xl text-sm leading-6 text-base-content/70">
                  {product.description}
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

                <div className="text-muted text-[16px] my-2">
                  In stock: {product.stock}
                </div>
                {/* Quantity */}
                {showCustomerActions && (
                  <div>
                    <p className="mb-2 text-sm font-bold">Quantity</p>

                    <div className="flex w-fit items-center overflow-hidden rounded-lg border border-base-300 bg-base-300">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        aria-label="Decrease quantity"
                        className="btn btn-ghost btn-square btn-sm rounded-none"
                      >
                        <FiMinus />
                      </button>

                      <span className="min-w-16 px-3 text-center text-sm font-bold">
                        {quantity} {product.unit}
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
                )}

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  {showCustomerActions && (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="btn btn-primary flex-1 rounded-lg font-bold shadow-sm"
                    >
                      <FiShoppingCart className="text-lg" />
                      Add to Cart
                    </button>
                  )}

                  {showCustomerActions && (
                    <button
                      type="button"
                      aria-label="Add product to favorites"
                      onClick={handleToggleFavorite}
                      className={`btn btn-square rounded-lg border-base-300 bg-base-300 hover:bg-base-100 ${
                        isFavorite ? "text-error" : ""
                      }`}
                    >
                      <FiHeart
                        className="text-xl"
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Share product"
                    className="btn btn-square rounded-lg border-base-300 bg-base-300 hover:bg-base-100"
                  >
                    <FiShare2 className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Farm information */}
          <section className="mt-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-md sm:p-6">
            <h2 className="text-sm font-extrabold text-base-content sm:text-base">
              Farm Information
            </h2>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {product.farm?.images?.[0]?.url ? (
                  <img
                    src={product.farm.images[0].url}
                    alt={product.farm?.name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-base-200"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-300 via-stone-500 to-stone-700 text-lg font-extrabold text-white ring-2 ring-base-200">
                    {product.farm?.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="font-extrabold text-base-content">
                    {product.farm?.name}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
                    <span className="flex items-center gap-1">
                      <FiMapPin className="text-primary" />
                      {product.farm?.location?.district}, Bangladesh
                    </span>

                    <span className="flex items-center gap-1">
                      <FiStar className="fill-secondary text-secondary" />
                      <strong className="text-base-content/80">
                        {farmAverageRating || "0"}
                      </strong>
                      ({farmReviews.length} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/farms/${product.farm?._id}`}
                className="btn btn-primary btn-sm w-full rounded-lg border-base-300 sm:w-auto sm:px-6"
              >
                View Farm
              </Link>
            </div>
          </section>
          {/* Related products — customer/guest only, after Farm Information section */}
          {showCustomerActions && relatedProducts.length > 0 && (
            <section className="mt-5">
              <h2 className="text-sm font-extrabold text-base-content sm:text-base mb-3">
                You Might Also Like
              </h2>

              <div className="flex flex-wrap gap-3">
                {relatedProducts.map((item) => (
                  <ProductCard
                    key={item._id}
                    id={item._id}
                    image={item.images?.[0]?.url}
                    name={item.name}
                    src={item.farm?.name}
                    price={
                      Math.round(
                        item.price *
                          (1 - (item.discountPercentage || 0) / 100) *
                          100,
                      ) / 100
                    }
                    unit={item.unit}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default ProductDetails;
