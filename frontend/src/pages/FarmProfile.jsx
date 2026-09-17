import { useParams } from "react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import { FaStar } from "react-icons/fa6";
import { getFarmById } from "../api/farm";
import { getProductById } from "../api/product";
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
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["farmReviews", id],
    queryFn: async () => {
      const { data } = await getFarmReviews(id);
      return data.reviews;
    },
    enabled: !!id,
  });

  const productIds = farm
    ? [
        ...farm.products.allYear,
        ...farm.products.winter,
        ...farm.products.summer,
        ...farm.products.monsoon,
      ]
    : [];

  const productQueries = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ["product", productId],
      queryFn: async () => {
        const { data } = await getProductById(productId);
        return data.product;
      },
      enabled: !!farm,
    })),
  });

  const products = productQueries.map((q) => q.data).filter(Boolean);

  if (isLoading || !farm) return <Loader/>;

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="p-4 space-y-6">
      {farm.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {farm.images.map((img) => (
            <img
              key={img.publicId}
              src={img.url}
              alt={farm.name}
              className="h-48 w-64 object-cover rounded-box shrink-0"
            />
          ))}
        </div>
      )}

      <div>
        <h1 className="text-3xl">{farm.name}</h1>
        <p className="text-muted">
          {farm.location?.village}, {farm.location?.upazila}, {farm.location?.district}
        </p>

        <div className="flex items-center gap-1 mt-1">
          <FaStar className="text-secondary" />
          <span>{avgRating !== null ? avgRating.toFixed(1) : "No ratings"}</span>
          {reviews.length > 0 && (
            <span className="text-xs text-muted-light">({reviews.length} reviews)</span>
          )}
        </div>

        {farm.establishedYear && (
          <p className="text-sm text-muted mt-1">Established {farm.establishedYear}</p>
        )}

        {farm.description && <p className="mt-2">{farm.description}</p>}

        {farm.size?.value && (
          <p className="text-sm text-muted mt-1">
            Size: {farm.size.value} {farm.size.unit}
          </p>
        )}

        {farm.farmType?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {farm.farmType.map((type) => (
              <span key={type} className="badge badge-secondary">
                {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {farm.farmer && (
        <div className="flex items-center gap-3 bg-base-300 rounded-box p-3 w-fit">
          <img
            src={farm.farmer.profileImage?.url || "/default-avatar.png"}
            alt={farm.farmer.user?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex flex-col">
          <p className="text-sm text-primary">Farmer</p>
          <p className="font-medium">{farm.farmer.user?.name}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl mb-2">Products from this farm</h2>
        <div className="flex flex-wrap gap-3">
          {products.length === 0 && (
            <p className="text-muted text-sm">No products listed yet.</p>
          )}
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
      </div>
    </div>
  );
};

export default FarmProfile;