import { FiVolume2, FiTrash2, FiTag } from "react-icons/fi";

const AnnouncementCard = ({ announcement, onMarkRead, onDelete }) => (
  <div
    className={`rounded-box border p-4 space-y-2 ${
      announcement.isRead
        ? "border-theme-light bg-base-100"
        : "border-primary/30 bg-primary-soft/40"
    }`}
    onClick={() => !announcement.isRead && onMarkRead(announcement.statusId)}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-full bg-secondary-soft flex items-center justify-center shrink-0">
          <FiVolume2 className="text-secondary" size={14} />
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm truncate ${announcement.isRead ? "font-semibold" : "font-bold"}`}
          >
            {announcement.title}
          </p>
          <p className="text-[11px] text-muted-light">
            {new Date(announcement.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!announcement.isRead && (
          <span className="badge badge-xs bg-primary border-none" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(announcement.statusId);
          }}
          className="btn btn-circle btn-ghost btn-xs text-muted-light hover:text-error"
        >
          <FiTrash2 size={13} />
        </button>
      </div>
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

export default AnnouncementCard;
