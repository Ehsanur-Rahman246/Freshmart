import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaStar } from "react-icons/fa6";
import { getFarmById } from "../api/farm";
import { getProducts } from "../api/product";
import { getFarmReviews } from "../api/review";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const FarmProfile = () => {
  const { id } = useParams();

  const { data: farm, isLoading } = useQuery({
    queryKey: ["farm", id],
    queryFn: async () => {
      const { data } = await getFarmById(id);
      return data.farm;
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["farmReviews", id],
    queryFn: async () => {
      const { data } = await getFarmReviews(id);
      return data.reviews;
    },
    enabled: !!id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["farmProducts", id],
    queryFn: async () => {
      const { data } = await getProducts(1, 100, "", { farm: id });
      return data.products;
    },
    enabled: !!id,
  });
  if (isLoading || !farm) {
    return <Loader />;
  }
  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;
  return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Farm Images */}
          {farm.images?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {farm.images.map((img, index) => (
                <img
                  key={img.publicId}
                  src={img.url}
                  alt={`${farm.name} ${index + 1}`}
                  className="w-full h-52 object-cover rounded-box"
                />
              ))}
            </div>
          )}
          {/* Farm Information + Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Farm Information */}
            <section className="space-y-5">
              <div>
                <h1 className="text-4xl font-semibold"> {farm.name} </h1>
                <p className="text-muted mt-1">
                  {farm.location?.village}, {farm.location?.upazila},
                  {farm.location?.district}
                </p>
                <div className="flex items-center gap-1 mt-3">
                  <FaStar className="text-secondary" />
                  <span className="font-medium">
                    {avgRating !== null ? avgRating.toFixed(1) : "No ratings"}
                  </span>
                  {reviews.length > 0 && (
                    <span className="text-sm text-muted">
                      ({reviews.length} reviews)
                    </span>
                  )}
                </div>
              </div>
              {farm.description && (
                <p className="text-base leading-7 max-w-3xl">
                  {farm.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {farm.establishedYear && (
                  <span className="badge badge-outline py-3">
                    Established {farm.establishedYear}
                  </span>
                )}
                {farm.size?.value && (
                  <span className="badge badge-outline py-3">
                    Size: {farm.size.value} {farm.size.unit}
                  </span>
                )}
                {farm.farmType?.map((type) => (
                  <span key={type} className="badge badge-secondary py-3">
                    {type}
                  </span>
                ))}
              </div>
              {/* Farmer */}
              {farm.farmer && (
                <section className="bg-base-300 rounded-box p-4 flex items-center gap-4">
                  <img
                    src={farm.farmer.profileImage?.url || "/default-avatar.png"}
                    alt={farm.farmer.user?.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs text-primary font-medium">FARMER</p>
                    <p className="font-semibold"> {farm.farmer.user?.name} </p>
                  </div>
                </section>
              )}
            </section>
            {/* Reviews */}
            <aside className="bg-base-300 rounded-box p-5 h-fit lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold mb-4"> Reviews </h2>
              {reviews.length === 0 ? (
                <p className="text-muted text-sm"> No reviews yet. </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="pb-4 border-b border-base-200 last:border-0"
                    >
                      <div className="flex items-center gap-1">
                        <FaStar className="text-secondary text-xs" />
                        <span className="text-sm font-medium">
                          {review.rating}
                        </span>
                        <span className="text-xs text-muted-light">
                          {review.customer?.user?.name}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm mt-1 leading-5">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>

          {/* Products */}
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">
                Products from this farm
              </h2>
              <p className="text-sm text-muted mt-1">
                Fresh products currently available from {farm.name}
              </p>
            </div>
            {products.length === 0 ? (
              <p className="text-muted text-sm"> No products listed yet. </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    image={product.images?.[0]?.url}
                    name={product.name}
                    src={farm.name}
                    price={product.price}
                    unit={product.unit}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
  );
};
export default FarmProfile;
