const ConversationCard = ({
  avatar,
  title,
  subtitle,
  time,
  unreadCount = 0,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-theme-light last:border-b-0 transition-colors
      ${isActive ? "bg-primary-soft" : "hover:bg-base-200"}`}
  >
    {avatar}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-sm truncate ${unreadCount > 0 ? "font-bold" : "font-semibold"}`}
        >
          {title}
        </p>
        {time && (
          <span className="text-[11px] text-muted-light shrink-0">{time}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <p
          className={`text-xs truncate ${unreadCount > 0 ? "text-base-content" : "text-muted-light"}`}
        >
          {subtitle}
        </p>
        {unreadCount > 0 && (
          <span className="badge badge-sm bg-primary text-primary-content border-none shrink-0">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  </button>
);

export default ConversationCard;
