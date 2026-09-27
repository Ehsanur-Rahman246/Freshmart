import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  getPricingRanges,
  createPricingRange,
  updatePricingRange,
  deletePricingRange,
} from "../api/pricing";
import { searchProductNames } from "../api/product";
import { getCategoryIcon } from "../utils/categoryIcons";
import PriceRangeGauge from "./PriceRangeGauge";

const emptyDraft = { name: "", category: "", unit: "", min: "", max: "" };

const PricingRangesPanel = ({ editable = false }) => {
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [newRange, setNewRange] = useState(emptyDraft);
  const [nameQuery, setNameQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["productNameSearch", nameQuery],
    queryFn: async () => (await searchProductNames(nameQuery)).data.results,
    enabled: nameQuery.trim().length > 0,
    staleTime: 1000 * 30,
  });

  const handleNameInput = (value) => {
    setNewRange((d) => ({ ...d, name: value }));
    setSelectedProduct(null); // typing invalidates any prior selection
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setNameQuery(value.trim()), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelectSuggestion = (s) => {
    setNewRange({
      name: s.name,
      category: s.category,
      unit: s.unit,
      min: newRange.min || String(s.min),
      max: newRange.max || String(s.max),
    });
    setSelectedProduct(s);
    setShowSuggestions(false);
    setNameQuery("");
  };

  const { data: ranges = [], isLoading } = useQuery({
    queryKey: ["pricingRanges"],
    queryFn: async () => (await getPricingRanges()).data.ranges,
    staleTime: 1000 * 60,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["pricingRanges"] });

  const createMutation = useMutation({
    mutationFn: (data) => createPricingRange(data),
    onSuccess: (res) => {
      toast.success(res.data.message || "Pricing range created");
      invalidate();
      setAdding(false);
      setNewRange(emptyDraft);
      setSelectedProduct(null);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not create range"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ name, ...data }) => updatePricingRange(name, data),
    onSuccess: (res) => {
      toast.success(res.data.message || "Pricing range updated");
      invalidate();
      setEditingName(null);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not update range"),
  });

  const deleteMutation = useMutation({
    mutationFn: (name) => deletePricingRange(name),
    onSuccess: () => {
      toast.success("Pricing range deleted");
      invalidate();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not delete range"),
  });

  const startEdit = (range) => {
    setDraft({
      name: range.normalizedName,
      category: range.category,
      min: range.min,
      max: range.max,
    });
    setEditingName(range.normalizedName);
  };

  const handleSaveEdit = () => {
    const min = Number(draft.min);
    const max = Number(draft.max);

    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < 0 ||
      max <= min
    ) {
      toast.error("Enter a valid min and max (max must be greater than min)");
      return;
    }

    updateMutation.mutate({
      name: draft.name,
      min,
      max,
    });
  };

  const handleCreate = () => {
    if (!selectedProduct || selectedProduct.name !== newRange.name) {
      return toast.error("Pick a listed product from the search results");
    }

    const min = Number(newRange.min);
    const max = Number(newRange.max);

    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < 0 ||
      max <= min
    ) {
      return toast.error(
        "Enter a valid min and max (max must be greater than min)",
      );
    }

    createMutation.mutate({
      name: newRange.name,
      category: newRange.category,
      unit: newRange.unit,
      min,
      max,
    });
  };

  if (isLoading) {
    return <div className="skeleton h-48 rounded-box" />;
  }

  return (
    <div className="rounded-box border border-theme bg-base-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold">
          {editable ? "Product Pricing Ranges" : "Price Baseline"}
        </h3>
        {!editable && (
          <span className="text-xs font-bold tracking-wider text-muted-light">
            ADMIN-SET RANGES
          </span>
        )}
      </div>

      {editable && (
        <div className="mb-4">
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="btn btn-sm btn-outline gap-1"
            >
              <FiPlus size={14} /> Add product range
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-theme bg-base-100">
              <div className="relative flex-1 min-w-40">
                <input
                  type="text"
                  value={newRange.name}
                  onChange={(e) => handleNameInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  placeholder="Search a listed product (e.g. Tomato)"
                  className="w-full px-2 py-1.5 rounded-lg border border-theme bg-base-100 text-sm"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 mt-1 w-72 max-h-56 overflow-y-auto rounded-lg border border-theme bg-base-100 shadow-lg">
                    {suggestions.map((s) => {
                      const Icon = getCategoryIcon(s.category);
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(s)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-base-200"
                        >
                          <Icon className="text-primary shrink-0" size={14} />
                          <span className="flex-1 truncate font-semibold">
                            {s.name}
                          </span>
                          <span className="text-xs text-muted-light capitalize shrink-0">
                            {s.category}
                          </span>
                          <span className="text-xs text-muted-light shrink-0">
                            ৳{s.min}–৳{s.max}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {selectedProduct && (
                <span className="text-xs text-muted-light capitalize px-2">
                  {selectedProduct.category}
                </span>
              )}
              <input
                type="number"
                min="0"
                value={newRange.min}
                onChange={(e) =>
                  setNewRange((d) => ({ ...d, min: e.target.value }))
                }
                placeholder="Min"
                className="w-20 px-2 py-1.5 rounded-lg border border-theme bg-base-100 text-sm"
              />
              <input
                type="number"
                min="0"
                value={newRange.max}
                onChange={(e) =>
                  setNewRange((d) => ({ ...d, max: e.target.value }))
                }
                placeholder="Max"
                className="w-20 px-2 py-1.5 rounded-lg border border-theme bg-base-100 text-sm"
              />
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="btn btn-xs btn-circle bg-primary text-primary-content"
              >
                <FiSave size={12} />
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewRange(emptyDraft);
                  setSelectedProduct(null);
                }}
                className="btn btn-xs btn-circle btn-ghost"
              >
                <FiX size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {ranges.length === 0 ? (
        <p className="text-sm text-muted-light">No pricing ranges set yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-box border border-theme-light bg-base-100">
          <table className="table">
            <thead>
              <tr className="text-xs text-muted-light">
                <th></th>
                <th>Product</th>
                <th>Category</th>
                <th>Range (per unit)</th>
                {editable && <th></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-light">
              {ranges.map((range) => {
                const Icon = getCategoryIcon(range.category);
                const isEditing = editingName === range.normalizedName;

                return (
                  <tr key={range._id}>
                    <td className="w-10">
                      <Icon className="text-primary" size={18} />
                    </td>
                    <td className="font-bold truncate max-w-45">
                      {range.productName}
                    </td>

                    {isEditing ? (
                      <>
                        <td className="text-muted-light capitalize">{range.category}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={draft.min}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  min: e.target.value,
                                }))
                              }
                              placeholder="Min"
                              className="w-20 px-2 py-1.5 rounded-lg border border-theme bg-base-100 text-sm"
                            />
                            <span className="text-muted-light">–</span>
                            <input
                              type="number"
                              min="0"
                              value={draft.max}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  max: e.target.value,
                                }))
                              }
                              placeholder="Max"
                              className="w-20 px-2 py-1.5 rounded-lg border border-theme bg-base-100 text-sm"
                            />
                          </div>
                        </td>
                        <td className="w-20">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={updateMutation.isPending}
                              className="btn btn-xs btn-circle bg-primary text-primary-content"
                            >
                              <FiSave size={12} />
                            </button>
                            <button
                              onClick={() => setEditingName(null)}
                              className="btn btn-xs btn-circle btn-ghost"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-muted-light capitalize">
                          {range.category}
                        </td>
                        <td className="min-w-40">
                          <PriceRangeGauge min={range.min} max={range.max} />
                          <span className="text-muted-light font-normal text-[10px]">
                            per {range.unit}
                          </span>
                        </td>
                        {editable && (
                          <td className="w-20">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(range)}
                                className="btn btn-xs btn-circle btn-ghost text-muted hover:text-primary"
                              >
                                <FiEdit2 size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete the pricing range for "${range.productName}"?`,
                                    )
                                  ) {
                                    deleteMutation.mutate(range.normalizedName);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="btn btn-xs btn-circle btn-ghost text-muted hover:text-error"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PricingRangesPanel;
