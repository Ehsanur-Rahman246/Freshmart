import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiChevronRight, FiPlus } from "react-icons/fi";
import { getMyProducts } from "../../api/product";
import Loader from "../../components/Loader";
import { useState } from "react";
import FarmPickerModal from "../../components/FarmPickerModal";

const Listings = () => {
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const { data } = await getMyProducts();
      return data.products;
    },
  });

  const groupedByFarm = (products || []).reduce((acc, product) => {
    const farmId = product.farm?._id || "unknown";
    if (!acc[farmId]) {
      acc[farmId] = {
        farmName: product.farm?.name || "Unknown Farm",
        items: [],
      };
    }
    acc[farmId].items.push(product);
    return acc;
  }, {});

  if (isLoading) return <Loader />;
  return (
    <div className="w-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme px-6 py-5">
        <div>
          <h2 className="mt-1 text-2xl font-extrabold">Your products</h2>
          <p className="mt-1 text-sm text-muted-light">
            Manage the products currently available on FreshMart.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center justify-center gap-2 rounded-box border border-dashed border-primary bg-primary-soft px-4 py-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-content"
        >
          <FiPlus size={17} /> Add new listing
        </button>
      </div>

      {/* Listings Content */}
      <div className="p-6 space-y-8">
        {Object.keys(groupedByFarm).length === 0 && (
          <p className="text-muted text-sm">
            You haven't listed any products yet.
          </p>
        )}

        {Object.entries(groupedByFarm).map(([farmId, group]) => (
          <div key={farmId}>
            <h3 className="text-lg font-extrabold mb-3">{group.farmName}</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((product) => (
                <div
                  key={product._id}
                  className="rounded-box border border-theme bg-base-100 p-5 transition hover:border-primary hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-extrabold">
                        {product.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-light">
                        {product.category}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.status === "active"
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-field bg-base-200 p-3">
                      <div className="text-xs text-muted-light">Stock</div>
                      <div className="mt-1 text-sm font-bold">
                        {product.stock}
                      </div>
                    </div>
                    <div className="rounded-field bg-base-200 p-3">
                      <div className="text-xs text-muted-light">Price</div>
                      <div className="mt-1 text-sm font-bold">
                        ৳{product.price}
                      </div>
                    </div>
                    <div className="rounded-field bg-base-200 p-3">
                      <div className="text-xs text-muted-light">Unit</div>
                      <div className="mt-1 text-sm font-bold">
                        /{product.unit}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-light">
                      {product.subCategory}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/farmer/listings/edit/${product._id}`)
                      }
                      className="btn btn-sm border-0 bg-primary-soft text-primary hover:bg-primary hover:text-primary-content"
                    >
                      Manage <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <FarmPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(farm) => navigate(`/farmer/listings/add/${farm._id}`)}
      />
    </div>
  );
};

export default Listings;
