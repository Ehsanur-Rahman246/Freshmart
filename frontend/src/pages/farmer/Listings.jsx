import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiChevronRight,
  FiPlus,
  FiDollarSign,
  FiLayers,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { getMyProducts } from "../../api/product";
import {
  respondToCompanySaleOffer,
  markCompanySaleReady,
} from "../../api/farmer";
import Loader from "../../components/Loader";
import FarmPickerModal from "../../components/FarmPickerModal";

const STAGE_LABEL = {
  awaitingFarmerResponse: "Awaiting Your Response",
  processing: "Processing",
  readyForPickup: "Ready for Pickup",
  pickedUp: "Picked Up",
  sold: "Sold",
  rejected: "Declined",
};

const STAGE_BADGE = {
  awaitingFarmerResponse: "bg-warning-soft text-warning",
  processing: "bg-info-soft text-info",
  readyForPickup: "bg-info-soft text-info",
  pickedUp: "bg-primary-soft text-primary",
  sold: "bg-success-soft text-success",
  rejected: "bg-error-soft text-error",
};

const MyListingsTab = ({ products, onAddNew }) => {
  const navigate = useNavigate();

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

  return (
    <div>
      <div className="flex items-center justify-end px-6 py-5">
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 rounded-box border border-dashed border-primary bg-primary-soft px-4 py-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-content"
        >
          <FiPlus size={17} /> Add new listing
        </button>
      </div>

      <div className="px-6 pb-6 space-y-8">
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
                      disabled={[
                        "awaitingFarmerResponse",
                        "processing",
                        "readyForPickup",
                        "pickedUp",
                      ].includes(product.companySaleStage)}
                      onClick={() =>
                        navigate(`/farmer/listings/edit/${product._id}`)
                      }
                      className="btn btn-sm border-0 bg-primary-soft text-primary hover:bg-primary hover:text-primary-content disabled:opacity-50"
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
    </div>
  );
};

const CompanySaleCard = ({ product, onRespond, onMarkReady, isMutating }) => {
  const image = product.images?.[0]?.url;

  return (
    <div className="rounded-box border border-theme bg-base-100 p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-field bg-base-200 overflow-hidden shrink-0">
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
        <p className="text-sm font-bold truncate">{product.name}</p>
        <p className="text-xs text-muted-light truncate">
          {product.farm?.name}
        </p>
        <p className="text-xs text-muted mt-0.5">
          Original ৳{product.price} → Offer ৳{product.companySalePrice ?? "—"} ·
          Stock: {product.stock}
        </p>
        {product.companySaleStage === "awaitingFarmerResponse" &&
          product.companySaleRespondBy && (
            <p className="text-[11px] text-warning mt-0.5">
              Respond by{" "}
              {new Date(product.companySaleRespondBy).toLocaleString()}
            </p>
          )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span
          className={`badge badge-sm border-none ${STAGE_BADGE[product.companySaleStage] || "bg-base-200"}`}
        >
          {STAGE_LABEL[product.companySaleStage] || product.companySaleStage}
        </span>

        {product.companySaleStage === "awaitingFarmerResponse" && (
          <div className="flex gap-2">
            <button
              onClick={() => onRespond(product._id, true)}
              disabled={isMutating}
              className="btn btn-xs bg-primary text-primary-content gap-1 disabled:opacity-50"
            >
              <FiCheck size={12} /> Accept
            </button>
            <button
              onClick={() => onRespond(product._id, false)}
              disabled={isMutating}
              className="btn btn-xs btn-outline gap-1 disabled:opacity-50"
            >
              <FiX size={12} /> Decline
            </button>
          </div>
        )}

        {product.companySaleStage === "processing" && (
          <button
            onClick={() => onMarkReady(product._id)}
            disabled={isMutating}
            className="btn btn-xs bg-primary text-primary-content disabled:opacity-50"
          >
            Mark Ready for Pickup
          </button>
        )}
      </div>
    </div>
  );
};

const CompanySalesTab = ({ products }) => {
  const queryClient = useQueryClient();

  const companySaleProducts = (products || []).filter(
    (p) => p.companySaleStage && p.companySaleStage !== "none",
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["myProducts"] });

  const respondMutation = useMutation({
    mutationFn: ({ productId, accept }) =>
      respondToCompanySaleOffer(productId, accept),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message || "Could not respond to offer",
      ),
  });

  const readyMutation = useMutation({
    mutationFn: (productId) => markCompanySaleReady(productId),
    onSuccess: () => {
      toast.success("Marked ready for pickup");
      invalidate();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not update"),
  });

  const isMutating = respondMutation.isPending || readyMutation.isPending;

  return (
    <div className="px-6 py-6">
      {companySaleProducts.length === 0 ? (
        <p className="text-sm text-muted-light text-center py-12">
          No company sale activity right now. Listings that expire with unsold
          stock will show up here.
        </p>
      ) : (
        <div className="space-y-3">
          {companySaleProducts.map((product) => (
            <CompanySaleCard
              key={product._id}
              product={product}
              onRespond={(productId, accept) =>
                respondMutation.mutate({ productId, accept })
              }
              onMarkReady={(productId) => readyMutation.mutate(productId)}
              isMutating={isMutating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Listings = () => {
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tab, setTab] = useState("listings");

  const { data: products, isLoading } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const { data } = await getMyProducts();
      return data.products;
    },
  });

  const pendingCount = (products || []).filter(
    (p) => p.companySaleStage === "awaitingFarmerResponse",
  ).length;

  if (isLoading) return <Loader />;

  return (
    <div className="w-full bg-base-100">
      <div className="flex items-center justify-between border-b border-theme px-6 py-5">
        <div>
          <h2 className="mt-1 text-2xl font-extrabold">Your products</h2>
          <p className="mt-1 text-sm text-muted-light">
            Manage the products currently available on FreshMart.
          </p>
        </div>

        <div role="tablist" className="tabs tabs-box">
          <button
            role="tab"
            className={`tab gap-1.5 ${tab === "listings" ? "tab-active" : ""}`}
            onClick={() => setTab("listings")}
          >
            <FiLayers size={14} /> Listings
          </button>
          <button
            role="tab"
            className={`tab gap-1.5 ${tab === "companySales" ? "tab-active" : ""}`}
            onClick={() => setTab("companySales")}
          >
            <FiDollarSign size={14} /> Company Sales
            {pendingCount > 0 && (
              <span className="badge badge-xs bg-warning-soft text-warning border-none ml-1">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === "listings" && (
        <MyListingsTab
          products={products}
          onAddNew={() => setPickerOpen(true)}
        />
      )}
      {tab === "companySales" && <CompanySalesTab products={products} />}

      <FarmPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(farm) => navigate(`/farmer/listings/add/${farm._id}`)}
      />
    </div>
  );
};

export default Listings;
