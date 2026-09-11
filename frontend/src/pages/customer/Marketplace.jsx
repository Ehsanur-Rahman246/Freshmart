import { useState } from "react";
import ProductCard from "../../components/ProductCard";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import Pagination from "../../components/Pagination";
import { useProducts } from "../../hooks/useProducts";
import { getCategoryIcon } from "../../utils/categoryIcons";

const SKELETON_COUNT = 10;

const Marketplace = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProducts(page, 50);

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center px-4">
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

        {!isLoading && !isError && products.length === 0 && (
          <p className="col-span-full text-center text-muted py-10">
            No products available right now.
          </p>
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
              badge={getCategoryIcon(product.category)}
            />
          ))}
      </div>

      {!isLoading && !isError && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default Marketplace;