import { useParams, useNavigate } from "react-router";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { FiHome, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { getFarmById } from "../../api/farm";
import { getProductById, deleteProduct } from "../../api/product";
import FarmDetailsForm from "../../forms/FarmDetailsForm";
import FarmPhotosManager from "../../forms/FarmPhotosManager";
import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader";

const FarmManage = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
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

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm("Remove this product listing? This cannot be undone.")) return;

    try {
      await deleteProduct(productId);
      queryClient.invalidateQueries({ queryKey: ["farm", farmId] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    } catch (error) {
      alert(error.response?.data?.message || "Could not remove product");
    }
  };

  if (isLoading || !farm) return <Loader />;

  return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/farmer/farms", { replace: true })}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-theme bg-base-200 text-muted hover:border-primary hover:text-primary"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme">
          <div>
            <h1 className="text-3xl font-extrabold">{farm.name}</h1>
            <p className="text-sm text-muted mt-1">Manage your farm's details and photos</p>
          </div>
          <FiHome size={30} className="text-primary" />
        </div>

        <div className="flex flex-col gap-6">
          <FarmDetailsForm mode="update" farm={farm} onSuccess={handleFarmUpdated} />
          <FarmPhotosManager farm={farm} onSuccess={handleFarmUpdated} />

          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Products from this farm</h2>

            {products.length === 0 && (
              <p className="text-muted text-sm">No products listed yet.</p>
            )}

            <div className="flex flex-wrap gap-3">
              {products.map((product) => (
                <div key={product._id} className="relative">
                  <ProductCard
                    id={product._id}
                    image={product.images?.[0]?.url}
                    name={product.name}
                    src={farm.name}
                    price={product.price}
                    unit={product.unit}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(product._id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-error-soft text-error hover:bg-error hover:text-white"
                    title="Remove product"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FarmManage;