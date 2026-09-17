import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard from "../../components/ProductCard";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import { getWishlist, removeFromWishlist } from "../../api/customer";
import { getCategoryIcon } from "../../utils/categoryIcons";

const Wishlist = () => {
  const queryClient = useQueryClient();

  const { mutate: removeWishlistItem } = useMutation({
    mutationFn: (productId) => removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
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
        {wishlist.map((product) => {
          const isOutOfStock = product.stock <= 0;

          return (
            <div key={product._id} className="relative">
              <ProductCard
                id={product._id}
                image={product.images?.[0]?.url}
                name={product.name}
                src={product.farm?.name}
                price={product.price}
                unit={product.unit}
                badge={getCategoryIcon(product.source)}
                isWishlisted={true}
              />

              {isOutOfStock && (
                <button
                  type="button"
                  onClick={() => removeWishlistItem(product._id)}
                  className="absolute top-2 left-0 z-10 w-[calc((100vw-28px)/2)] max-w-50 h-70 flex items-center justify-center rounded-[10px] bg-overlay cursor-pointer"
                >
                  <span className="rounded-lg bg-error px-3 py-1.5 text-sm font-bold text-error-content">
                    Out of Stock
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
