import { useParams } from "react-router";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { getFarmById } from "../../api/farm";
import { getProductById } from "../../api/product";
import FarmDetailsForm from "../../forms/FarmDetailsForm";
import FarmPhotosManager from "../../forms/FarmPhotosManager";
import ProductCard from "../../components/ProductCard";

const FarmManage = () => {
  const { farmId } = useParams();
  const queryClient = useQueryClient();

  const { data: farm, isLoading } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: async () => {
      const { data } = await getFarmById(farmId);
      return data.farm;
    },
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

  const handleFarmUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["farm", farmId] });
    queryClient.invalidateQueries({ queryKey: ["myFarms"] });
  };

  if (isLoading || !farm) return <p className="p-4">Loading farm...</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl">Manage Farm</h1>

      <FarmDetailsForm mode="update" farm={farm} onSuccess={handleFarmUpdated} />
      <FarmPhotosManager farm={farm} onSuccess={handleFarmUpdated} />

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

export default FarmManage;