import { useState } from "react";
import toast from "react-hot-toast";
import { FiSend } from "react-icons/fi";
import { useCreateAnnouncement } from "../hooks/useAnnouncements";
import { usePromoCodes } from "../hooks/usePromoCodes";

const AUDIENCES = [
  { value: "all", label: "Everyone" },
  { value: "customer", label: "Customers only" },
  { value: "farmer", label: "Farmers only" },
];

const CreateAnnouncementForm = () => {
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [promoCodeId, setPromoCodeId] = useState("");

  const { data: promoCodes = [] } = usePromoCodes();
  const activePromoCodes = promoCodes.filter((p) => p.isActive);

  const createMutation = useCreateAnnouncement();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    createMutation.mutate(
      {
        audience,
        title: title.trim(),
        message: message.trim(),
        promoCodeId: promoCodeId || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Announcement sent");
          setTitle("");
          setMessage("");
          setPromoCodeId("");
        },
        onError: (error) =>
          toast.error(
            error?.response?.data?.message || "Could not send announcement",
          ),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-base-100 rounded-box border border-theme-light p-4 space-y-4"
    >
      <h2 className="text-sm font-bold">Broadcast an announcement</h2>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">Audience</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {AUDIENCES.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setAudience(opt.value)}
              className={`btn btn-sm ${
                audience === opt.value
                  ? "bg-primary text-primary-content border-none"
                  : "btn-outline"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">Title</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Announcement title"
          className="input input-bordered input-sm sm:input-md w-full"
        />
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">Message</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Write the announcement..."
          className="textarea textarea-bordered w-full text-sm"
        />
      </div>
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">
            Attach Promo Code (optional)
          </span>
        </label>
        <select
          value={promoCodeId}
          onChange={(e) => setPromoCodeId(e.target.value)}
          className="select select-bordered select-sm sm:select-md w-full"
        >
          <option value="">No promo code</option>
          {activePromoCodes.map((promo) => (
            <option key={promo._id} value={promo._id}>
              {promo.code} —{" "}
              {promo.discountType === "flat"
                ? `৳${promo.discountValue} off`
                : `${promo.discountValue}% off`}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending || !title.trim() || !message.trim()}
        className="btn bg-primary text-primary-content btn-sm sm:btn-md w-full sm:w-auto"
      >
        <FiSend /> Send Announcement
      </button>
    </form>
  );
};

export default CreateAnnouncementForm;
