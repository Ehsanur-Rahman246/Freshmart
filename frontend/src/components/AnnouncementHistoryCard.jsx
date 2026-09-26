import { FiVolume2, FiUsers, FiTag } from "react-icons/fi";

const AUDIENCE_LABEL = {
  all: "Everyone",
  customer: "Customers",
  farmer: "Farmers",
};

const AnnouncementHistoryCard = ({ announcement }) => (
  <div className="border border-theme-light rounded-box p-4 space-y-2 bg-base-100">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
          <FiVolume2 className="text-primary" size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{announcement.title}</p>
          <p className="text-[11px] text-muted-light">
            by {announcement.createdBy?.name || "Admin"} ·{" "}
            {new Date(announcement.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <span className="badge badge-sm bg-info-soft text-info border-none shrink-0 gap-1">
        <FiUsers size={10} />
        {AUDIENCE_LABEL[announcement.audience]}
      </span>
    </div>

    <p className="text-sm text-muted whitespace-pre-wrap">
      {announcement.message}
    </p>
    {announcement.promoCode && (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-secondary">
        <FiTag size={11} />
        {announcement.promoCode.code} —{" "}
        {announcement.promoCode.discountType === "flat"
          ? `৳${announcement.promoCode.discountValue} off`
          : `${announcement.promoCode.discountValue}% off`}
      </div>
    )}
  </div>
);

export default AnnouncementHistoryCard;
