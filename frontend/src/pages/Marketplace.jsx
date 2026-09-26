import { useMemo } from "react";
import { useSearchParams, useLocation } from "react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { getProducts } from "../api/product";
import { getWishlist } from "../api/customer";
import { getSourceIcon } from "../utils/sourceIcons";
import { useViewer } from "../hooks/useViewer";
import { useInfiniteScrollTrigger } from "../hooks/useInfiniteScrollTrigger";
import { filterProductsByCategory } from "../utils/search";
import SearchBar from "../components/SearchBar";
import { getCategoryIcon } from "../utils/categoryIcons";
import {FiGrid} from "react-icons/fi";

const CATEGORIES = [
  "dairy",
  "grain",
  "spices",
  "poultry",
  "livestock",
  "fruits",
  "vegetables",
];

const PAGE_SIZE = 20;
const SKELETON_COUNT = 10;

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const { role } = useViewer();

  const location = useLocation();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "infinite", query],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await getProducts(pageParam, PAGE_SIZE, query);
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist().then((res) => res.data),
    enabled: role === "customer",
  });

  const allProducts = useMemo(
    () => data?.pages.flatMap((p) => p.products) ?? [],
    [data],
  );

  const filteredProducts = useMemo(
    () => filterProductsByCategory(allProducts, category),
    [allProducts, category],
  );

  const sentinelRef = useInfiniteScrollTrigger(
    fetchNextPage,
    Boolean(hasNextPage) && !isFetchingNextPage,
  );

  const wishlistedIds = new Set(
    (wishlistData?.wishlist ?? []).map((p) => p._id),
  );

  const clearCategory = () => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("category");
      return params;
    });
  };

  const setCategory = (value) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (params.get("category") === value) {
        params.delete("category");
      } else {
        params.set("category", value);
      }
      return params;
    });
  };

  return (
    <div className="flex flex-col items-center px-4">
      {role !== "customer" && (
        <div className="w-full max-w-xl mb-6">
          <SearchBar mode="products" resultsBasePath={location.pathname} />
        </div>
      )}
      <div className="w-full flex flex-col max-w-6xl mt-4 mb-2">
        <div className="font-bold text-2xl">Top Categories</div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            onClick={clearCategory}
            className={`flex flex-col items-center gap-2 px-5 py-4 rounded-box border transition min-w-24 shrink-0 ${
              !category
                ? "border-primary bg-primary-soft"
                : "border-theme bg-base-200 hover:border-primary hover:bg-primary-soft"
            }`}
          >
            <FiGrid className="text-2xl text-primary" />
            <span className="text-xs font-bold">All</span>
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat);
            const isActive = category === cat;

            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-2 px-5 py-4 rounded-box border transition min-w-24 shrink-0 ${
                  isActive
                    ? "border-primary bg-primary-soft"
                    : "border-theme bg-base-200 hover:border-primary hover:bg-primary-soft"
                }`}
              >
                <Icon
                  className={`text-2xl ${isActive ? "text-primary" : "text-primary"}`}
                />
                <span className="text-xs font-bold capitalize">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-fit">
        {isLoading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}

        {isError && (
          <p className="col-span-full text-center text-error py-10">
            Couldn't load products. Please try again.
          </p>
        )}

        {!isLoading && !isError && filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-muted py-10">
            No products found.
          </p>
        )}

        {!isLoading &&
          !isError &&
          filteredProducts.map((product) => (
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

      <div ref={sentinelRef} className="h-4 w-full" />

      {isFetchingNextPage && (
        <p className="text-sm text-muted py-4">Loading more...</p>
      )}
    </div>
  );
};

export default Marketplace;
