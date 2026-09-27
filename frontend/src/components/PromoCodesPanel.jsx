import { useState } from "react";
import toast from "react-hot-toast";
import { FiTag, FiPlus, FiX, FiCheck } from "react-icons/fi";
import {
  usePromoCodes,
  useCreatePromoCode,
  useUpdatePromoCode,
} from "../hooks/usePromoCodes";

const emptyForm = {
  code: "",
  discountType: "flat",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "",
  usageLimit: "",
  oncePerCustomer: true,
  expiresAt: "",
};

const PromoCodesPanel = () => {
  const { data: promoCodes = [], isLoading } = usePromoCodes();
  const createMutation = useCreatePromoCode();
  const updateMutation = useUpdatePromoCode();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const update = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();

    const code = form.code.trim();
    const discountValue = Number(form.discountValue);

    if (!code) return toast.error("Enter a promo code");
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return toast.error("Discount value must be greater than 0");
    }

    const payload = {
      code,
      discountType: form.discountType,
      discountValue,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      oncePerCustomer: form.oncePerCustomer,
      expiresAt: form.expiresAt || null,
    };

    if (form.discountType === "percentage" && form.maxDiscount) {
      payload.maxDiscount = Number(form.maxDiscount);
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Promo code created");
        setForm(emptyForm);
        setShowForm(false);
      },
      onError: (error) =>
        toast.error(
          error?.response?.data?.message || "Could not create promo code",
        ),
    });
  };

  const toggleActive = (promo) => {
    updateMutation.mutate(
      { promoCodeId: promo._id, data: { isActive: !promo.isActive } },
      {
        onSuccess: () =>
          toast.success(
            promo.isActive ? "Promo code disabled" : "Promo code enabled",
          ),
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Could not update"),
      },
    );
  };

  return (
    <div className="bg-base-100 rounded-box border border-theme-light p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <FiTag /> Promo Codes
        </h2>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="btn btn-sm btn-outline gap-1"
        >
          {showForm ? <FiX size={14} /> : <FiPlus size={14} />}
          {showForm ? "Cancel" : "New Code"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="border border-theme-light rounded-box p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">Code</span>
              <input
                type="text"
                value={form.code}
                onChange={update("code")}
                placeholder="FRESH20"
                className="input input-bordered input-sm w-full uppercase"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">
                Discount Type
              </span>
              <select
                value={form.discountType}
                onChange={update("discountType")}
                className="select select-bordered select-sm w-full"
              >
                <option value="flat">Flat (৳)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">
                Discount Value
              </span>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={update("discountValue")}
                placeholder={form.discountType === "percentage" ? "10" : "50"}
                className="input input-bordered input-sm w-full"
              />
            </label>

            {form.discountType === "percentage" && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted">
                  Max Discount (optional)
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={update("maxDiscount")}
                  placeholder="No cap"
                  className="input input-bordered input-sm w-full"
                />
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">
                Minimum Order Value
              </span>
              <input
                type="number"
                min="0"
                value={form.minOrderValue}
                onChange={update("minOrderValue")}
                placeholder="0"
                className="input input-bordered input-sm w-full"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">
                Usage Limit (optional)
              </span>
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={update("usageLimit")}
                placeholder="Unlimited"
                className="input input-bordered input-sm w-full"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">
                Expires At (optional)
              </span>
              <input
                type="date"
                value={form.expiresAt}
                onChange={update("expiresAt")}
                className="input input-bordered input-sm w-full"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold mt-5">
              <input
                type="checkbox"
                checked={form.oncePerCustomer}
                onChange={update("oncePerCustomer")}
                className="checkbox checkbox-sm"
              />
              Once per customer
            </label>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn btn-sm bg-primary text-primary-content w-full sm:w-auto"
          >
            {createMutation.isPending ? "Creating..." : "Create Promo Code"}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-light text-center py-6">Loading...</p>
      ) : promoCodes.length === 0 ? (
        <p className="text-sm text-muted-light text-center py-6">
          No promo codes created yet.
        </p>
      ) : (
        <div className="divide-y divide-theme-light">
          {promoCodes.map((promo) => (
            <div
              key={promo._id}
              className="py-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">
                    {promo.code}
                  </span>
                  <span
                    className={`badge badge-xs border-none ${
                      promo.isActive
                        ? "bg-success-soft text-success"
                        : "bg-base-200 text-muted"
                    }`}
                  >
                    {promo.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-muted-light mt-0.5">
                  {promo.discountType === "flat"
                    ? `৳${promo.discountValue} off`
                    : `${promo.discountValue}% off${promo.maxDiscount ? ` (up to ৳${promo.maxDiscount})` : ""}`}
                  {promo.minOrderValue > 0 && ` · Min ৳${promo.minOrderValue}`}
                  {` · Used ${promo.usedCount}${promo.usageLimit ? `/${promo.usageLimit}` : ""}`}
                  {promo.expiresAt &&
                    ` · Expires ${new Date(promo.expiresAt).toLocaleDateString()}`}
                </p>
              </div>

              <button
                onClick={() => toggleActive(promo)}
                disabled={updateMutation.isPending}
                className={`btn btn-xs gap-1 ${
                  promo.isActive
                    ? "btn-outline"
                    : "bg-primary text-primary-content"
                }`}
              >
                <FiCheck size={12} />
                {promo.isActive ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoCodesPanel;
