import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiLayers, FiDollarSign, FiTag } from "react-icons/fi";
import { PiFarmLight } from "react-icons/pi";
import {
  getAllProductsAdmin,
  getCompanySaleQueue,
  markCompanySalePickedUp,
  finalizeCompanySale,
} from "../../api/admin";
import { getCategoryIcon } from "../../utils/categoryIcons";
import Loader from "../../components/Loader";
import PricingRangesPanel from "../../components/PricingRangesPanel";

const STATUS_BADGE = {
  active: "bg-success-soft text-success",
  soldOut: "bg-warning-soft text-warning",
  expired: "bg-error-soft text-error",
  inTransfer: "bg-info-soft text-info",
  soldToCompany: "bg-purple-soft text-purple",
  inactive: "bg-base-200 text-muted",
};

const STATUS_LABEL = {
  active: "Active",
  soldOut: "Sold Out",
  expired: "Expired",
  inTransfer: "In Transfer",
  soldToCompany: "Sold to Company",
  inactive: "Inactive",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "soldOut", label: "Sold Out" },
  { value: "expired", label: "Expired" },
  { value: "inTransfer", label: "In Transfer" },
  { value: "soldToCompany", label: "Sold to Company" },
  { value: "inactive", label: "Inactive" },
];

const ProductListingCard = ({ product, onClick }) => {
  const image = product.images?.[0]?.url;
  const Icon = getCategoryIcon(product.category);

  return (
    <button
      onClick={onClick}
      className="text-left bg-base-100 border border-theme-light rounded-box overflow-hidden hover:shadow-md transition w-44 shrink-0"
    >
      <div className="w-full h-28 bg-base-200 overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          // eslint-disable-next-line react-hooks/static-components
          <Icon className="text-3xl text-primary/40" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold truncate">{product.name}</p>
        <p className="text-xs text-muted-light truncate mt-0.5">
          ৳{product.price} / {product.unit} · Stock: {product.stock}
        </p>
        <span
          className={`badge badge-xs border-none mt-2 ${STATUS_BADGE[product.status] || "bg-base-200"}`}
        >
          {STATUS_LABEL[product.status] || product.status}
        </span>
      </div>
    </button>
  );
};

const FarmSection = ({ farmName, products, onSelect }) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
      <PiFarmLight className="text-primary" /> {farmName}
      <span className="text-xs font-normal text-muted-light">
        ({products.length})
      </span>
    </h3>
    <div className="flex gap-3 overflow-x-auto pb-2">
      {products.map((p) => (
        <ProductListingCard
          key={p._id}
          product={p}
          onClick={() => onSelect(p._id)}
        />
      ))}
    </div>
  </div>
);

const ListingsTab = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products", statusFilter],
    queryFn: async () =>
      (await getAllProductsAdmin(statusFilter)).data.products,
  });

  const grouped = useMemo(() => {
    const map = new Map();
    for (const product of products) {
      const farmId = product.farm?._id || "unknown";
      const farmName = product.farm?.name || "Unknown Farm";
      if (!map.has(farmId)) map.set(farmId, { farmName, products: [] });
      map.get(farmId).products.push(product);
    }
    return [...map.values()].sort((a, b) =>
      a.farmName.localeCompare(b.farmName),
    );
  }, [products]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => setStatusFilter(f.value)}
            className={`badge gap-1 cursor-pointer ${
              statusFilter === f.value ? "badge-primary" : "badge-ghost"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader />
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-light text-center py-12">
          No products found.
        </p>
      ) : (
        grouped.map((group) => (
          <FarmSection
            key={group.farmName}
            farmName={group.farmName}
            products={group.products}
            onSelect={(id) => navigate(`/products/${id}`)}
          />
        ))
      )}
    </div>
  );
};

const STAGE_FILTERS = [
  { value: "", label: "Active Queue" },
  { value: "all", label: "All Stages" },
  { value: "awaitingFarmerResponse", label: "Awaiting Farmer" },
  { value: "processing", label: "Processing" },
  { value: "readyForPickup", label: "Ready for Pickup" },
  { value: "pickedUp", label: "Picked Up" },
  { value: "sold", label: "Sold" },
  { value: "rejected", label: "Rejected" },
];

const STAGE_BADGE = {
  awaitingFarmerResponse: "bg-warning-soft text-warning",
  processing: "bg-info-soft text-info",
  readyForPickup: "bg-info-soft text-info",
  pickedUp: "bg-primary-soft text-primary",
  sold: "bg-success-soft text-success",
  rejected: "bg-error-soft text-error",
};

const CompanySaleCard = ({ product, onPickedUp, onFinalize, isMutating }) => {
  const image = product.images?.[0]?.url;

  return (
    <div className="border border-theme-light rounded-box p-4 flex items-center gap-4">
      <div className="w-14 h-14 rounded-field bg-base-200 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-light text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{product.name}</p>
        <p className="text-xs text-muted-light truncate">
          {product.farm?.name} · {product.farmer?.user?.name}
        </p>
        <p className="text-xs text-muted mt-0.5">
          ৳{product.companySalePrice ?? product.price} · Stock: {product.stock}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span
          className={`badge badge-sm border-none ${STAGE_BADGE[product.companySaleStage] || "bg-base-200"}`}
        >
          {product.companySaleStage}
        </span>

        {product.companySaleStage === "readyForPickup" && (
          <button
            onClick={() => onPickedUp(product._id)}
            disabled={isMutating}
            className="btn btn-xs bg-primary text-primary-content disabled:opacity-50"
          >
            Mark Picked Up
          </button>
        )}

        {product.companySaleStage === "pickedUp" && (
          <button
            onClick={() => onFinalize(product._id)}
            disabled={isMutating}
            className="btn btn-xs bg-secondary text-secondary-content disabled:opacity-50"
          >
            Finalize Sale
          </button>
        )}
      </div>
    </div>
  );
};

const CompanySaleTab = () => {
  const queryClient = useQueryClient();
  const [stageFilter, setStageFilter] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "companySales", stageFilter],
    queryFn: async () => (await getCompanySaleQueue(stageFilter)).data.products,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "companySales"] });

  const pickedUpMutation = useMutation({
    mutationFn: (productId) => markCompanySalePickedUp(productId),
    onSuccess: () => {
      toast.success("Marked as picked up");
      invalidate();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not update"),
  });

  const finalizeMutation = useMutation({
    mutationFn: ({ productId, company }) =>
      finalizeCompanySale(productId, company),
    onSuccess: () => {
      toast.success("Sale finalized");
      invalidate();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not finalize sale"),
  });

  const handleFinalize = (productId) => {
    const company = window.prompt(
      "Enter the company name to finalize this sale:",
    );
    if (!company || !company.trim()) return;
    finalizeMutation.mutate({ productId, company: company.trim() });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {STAGE_FILTERS.map((f) => (
          <button
            key={f.value || "default"}
            onClick={() => setStageFilter(f.value)}
            className={`badge gap-1 cursor-pointer ${
              stageFilter === f.value ? "badge-primary" : "badge-ghost"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-light text-center py-12">
          No company sale listings in this stage.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <CompanySaleCard
              key={product._id}
              product={product}
              onPickedUp={(id) => pickedUpMutation.mutate(id)}
              onFinalize={handleFinalize}
              isMutating={
                pickedUpMutation.isPending || finalizeMutation.isPending
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Products = () => {
  const [tab, setTab] = useState("listings");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Products</h1>
        <p className="text-sm text-muted-light mt-1">
          All product listings across every farm
        </p>
      </div>

      <div role="tablist" className="tabs tabs-box w-fit">
        <button
          role="tab"
          className={`tab ${tab === "listings" ? "tab-active" : ""}`}
          onClick={() => setTab("listings")}
        >
          <FiLayers className="mr-1.5" /> Listings
        </button>
        <button
          role="tab"
          className={`tab ${tab === "companySales" ? "tab-active" : ""}`}
          onClick={() => setTab("companySales")}
        >
          <FiDollarSign className="mr-1.5" /> Company Sales
        </button>
        <button
          role="tab"
          className={`tab ${tab === "pricing" ? "tab-active" : ""}`}
          onClick={() => setTab("pricing")}
        >
          <FiTag className="mr-1.5" /> Pricing Ranges
        </button>
      </div>

      {tab === "listings" && <ListingsTab />}
      {tab === "companySales" && <CompanySaleTab />}
      {tab === "pricing" && (
        <div className="max-w-2xl">
          <PricingRangesPanel editable />
        </div>
      )}
    </div>
  );
};

export default Products;
