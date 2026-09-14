import { FiStar, FiFlag, FiMessageSquare, FiTrash2, FiEdit2 } from "react-icons/fi";
import { timeAgo } from "../notification/timeAgo";
import { useState } from "react";

const Stars = ({ rating }) => (
  <span className="flex gap-0.5 text-secondary">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar key={n} className={n <= rating ? "fill-current" : ""} size={14} />
    ))}
  </span>
);

const Avatar = ({ src, name }) => (
  <div className="w-6 h-6 rounded-full bg-base-300 overflow-hidden shrink-0 flex items-center justify-center">
    {src ? (
      <img src={src} alt={name || "User"} className="w-full h-full object-cover" />
    ) : (
      <span className="text-[10px] font-bold text-muted">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    )}
  </div>
);

const ReplyItem = ({ reply, canDelete, onDelete }) => (
  <div className="bg-base-200 rounded-box p-3 flex items-start justify-between gap-2">
    <div className="flex items-start gap-2">
      <Avatar src={reply.authorProfileImage} name={reply.author?.name} />
      <div>
        <p className="text-xs font-bold">{reply.author?.name || "User"}</p>
        <p className="text-sm">{reply.message}</p>
        <p className="text-xs text-muted-light mt-1">{timeAgo(reply.createdAt)}</p>
      </div>
    </div>
    {canDelete && (
      <button
        onClick={() => onDelete(reply._id)}
        className="btn btn-ghost btn-xs btn-circle text-error shrink-0"
      >
        <FiTrash2 size={12} />
      </button>
    )}
  </div>
);

const InlineReplyBox = ({ onCancel, onSubmit }) => {
  const [text, setText] = useState("");

  return (
    <div className="bg-base-200 rounded-box p-3 space-y-2">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Write your reply..."
        className="textarea textarea-bordered textarea-sm w-full"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn btn-ghost btn-xs">
          Cancel
        </button>
        <button
          onClick={() => text.trim() && onSubmit(text.trim())}
          disabled={!text.trim()}
          className="btn btn-primary btn-xs"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const ReviewCard = ({
  review,
  role,
  isReplying,
  onReplyClick,
  onReplyCancel,
  onReplySubmit,
  onReport,
  onDeleteReview,
  onDeleteReply,
  onEditReview,
  currentUserId,
}) => {
  const target = review.product?.name || review.farm?.name || "—";
  const targetType = review.product ? "Product" : "Farm";

  return (
    <div className="rounded-box border border-theme-light bg-base-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-sm">
            {review.customer?.user?.name || "Customer"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars rating={review.rating} />
            <span className="text-xs text-muted-light">
              {timeAgo(review.createdAt)}
            </span>
          </div>
        </div>
        <span className="badge badge-sm bg-primary-soft text-primary border-none">
          {targetType}: {target}
        </span>
      </div>

      {review.comment && <p className="text-sm text-muted">{review.comment}</p>}

      {review.replies?.length > 0 && (
        <div className="space-y-2">
          {review.replies.map((reply) => (
            <ReplyItem
              key={reply._id}
              reply={reply}
              canDelete={role === "admin" || reply.author?._id === currentUserId}
              onDelete={(replyId) => onDeleteReply(review._id, replyId)}
            />
          ))}
        </div>
      )}

      {isReplying && (
        <InlineReplyBox onCancel={onReplyCancel} onSubmit={onReplySubmit} />
      )}

      <div className="flex justify-end gap-2 pt-1 border-t border-theme-light">
        <button onClick={() => onReplyClick(review._id)} className="btn btn-ghost btn-xs gap-1">
          <FiMessageSquare size={13} /> Reply
        </button>
        <button onClick={() => onReport(review._id)} className="btn btn-ghost btn-xs gap-1 text-warning">
          <FiFlag size={13} /> Report
        </button>
        {role === "customer" && (
          <>
            <button onClick={() => onEditReview(review)} className="btn btn-ghost btn-xs gap-1">
              <FiEdit2 size={13} /> Edit
            </button>
            <button onClick={() => onDeleteReview(review._id)} className="btn btn-ghost btn-xs gap-1 text-error">
              <FiTrash2 size={13} /> Delete
            </button>
          </>
        )}
        {role === "admin" && (
          <button onClick={() => onDeleteReview(review._id)} className="btn btn-ghost btn-xs gap-1 text-error">
            <FiTrash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;