import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import HeroSlider from "../../components/HeroSlider";
import ProductCard from "../../components/ProductCard";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import { getProducts } from "../../api/product";
import { getWishlist } from "../../api/customer";
import { getSourceIcon } from "../../utils/sourceIcons";
import { PRODUCT_CATEGORIES } from "../../utils/productConstants";
import { getCategoryIcon } from "../../utils/categoryIcons";

const RECENT_COUNT = 15;
const SKELETON_COUNT = 10;

const Dashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "recent"],
    queryFn: async () => (await getProducts(1, RECENT_COUNT)).data,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist().then((res) => res.data),
  });

  const products = data?.products ?? [];
  const wishlistedIds = new Set(
    (wishlistData?.wishlist ?? []).map((p) => p._id),
  );

  return (
    <div>
      <HeroSlider />

      <section className="px-4 sm:px-6 lg:px-10 py-8">
        <h2 className="text-xl font-extrabold mb-4">Top Categories</h2>
        <div className="flex flex-wrap gap-3">
          {PRODUCT_CATEGORIES.map((category) => {
            const Icon = getCategoryIcon(category);

            return (
              <button
                key={category}
                onClick={() =>
                  navigate(`/customer/marketplace?category=${category}`)
                }
                className="flex flex-col items-center gap-2 px-5 py-4 rounded-box border border-theme bg-base-200 hover:border-primary hover:bg-primary-soft transition min-w-24"
              >
                <Icon className="text-2xl text-primary" />
                <span className="text-xs font-bold capitalize">{category}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">Fresh Picks</h2>
          <button
            onClick={() => navigate("/customer/marketplace")}
            className="btn btn-primary btn-sm rounded-field"
          >
            View Market
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {isLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}

          {isError && (
            <p className="text-error py-10">Couldn't load products.</p>
          )}

          {!isLoading &&
            !isError &&
            products.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                image={product.images?.[0]?.url}
                name={product.name}
                src={product.farm?.name}
                price={product.price}
                unit={product.unit}
                badge={getSourceIcon(product.source)}
                isWishlisted={wishlistedIds.has(product._id)}
              />
            ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
