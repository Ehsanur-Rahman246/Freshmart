import { useQuery } from "@tanstack/react-query";
import ProductCard from "../../components/ProductCard";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import { getWishlist } from "../../api/customer";
import { getCategoryIcon } from "../../utils/categoryIcons";

const Wishlist = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist().then((res) => res.data),
  });

  const wishlist = data?.wishlist || [];

  if (isLoading) {
    return (
        <div className="flex flex-col items-center px-4">

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-fit">
        {Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
        ))}
      </div>
        </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-fit">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            id={product._id}
            image={product.images?.[0]?.url}
            name={product.name}
            src={product.farm?.name}
            price={product.price}
            unit={product.unit}
            badge={getCategoryIcon(product.source)}
            isWishlisted={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
