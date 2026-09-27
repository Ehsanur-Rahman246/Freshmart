import { FiMail } from "react-icons/fi";

const SCOPE_LABEL = {
  single: "Single User",
  allCustomers: "All Customers",
  allFarmers: "All Farmers",
  all: "Everyone",
};

const EmailLogCard = ({ log }) => (
  <div className="border border-theme-light rounded-box p-4 space-y-2 bg-base-100">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-full bg-secondary-soft flex items-center justify-center shrink-0">
          <FiMail className="text-secondary" size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{log.subject}</p>
          <p className="text-[11px] text-muted-light">
            by {log.sentBy?.name || "Admin"} ·{" "}
            {new Date(log.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <span className="badge badge-sm bg-base-200 border-none shrink-0">
        {log.recipientScope === "single"
          ? log.recipientUser?.name || "User"
          : SCOPE_LABEL[log.recipientScope]}
      </span>
    </div>

    <p className="text-sm text-muted whitespace-pre-wrap">{log.message}</p>
  </div>
);

export default EmailLogCard;
