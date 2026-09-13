import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiStar,
  FiFlag,
  FiMessageSquare,
  FiTrash2,
  FiX,
  FiEdit2,
} from "react-icons/fi";
import { useViewer } from "../hooks/useViewer";
import {
  getMyReviews,
  getFarmerReviews,
  getAllReviewsAdmin,
  addReviewReply,
  reportReview,
  adminDeleteReview,
  deleteReply,
  updateReview,
  deleteReview,
} from "../api/review";

const TABS = ["All", "Farms", "Products"];

const Stars = ({ rating }) => (
  <span className="flex gap-0.5 text-secondary">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar key={n} className={n <= rating ? "fill-current" : ""} size={14} />
    ))}
  </span>
);

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

const MessageModal = ({ mode, onClose, onSubmit }) => {
  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-box p-5 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">
            {mode === "reply" ? "Write a reply" : "Report this review"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
            <FiX size={16} />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={
            mode === "reply"
              ? "Write your reply..."
              : "Tell the admin what's wrong with this review..."
          }
          className="textarea textarea-bordered w-full"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSubmit(text.trim())}
            disabled={!text.trim()}
            className="btn btn-sm btn-primary"
          >
            {mode === "reply" ? "Send Reply" : "Send Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditReviewModal = ({ review, onClose, onSubmit }) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment || "");

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-box p-5 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Edit your review</h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
            <FiX size={16} />
          </button>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <FiStar
                size={20}
                className={
                  n <= rating
                    ? "fill-current text-secondary"
                    : "text-muted-light"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="textarea textarea-bordered w-full"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ rating, comment })}
            className="btn btn-sm btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ src, name }) => (
  <div className="w-6 h-6 rounded-full bg-base-300 overflow-hidden shrink-0 flex items-center justify-center">
    {src ? (
      <img
        src={src}
        alt={name || "User"}
        className="w-full h-full object-cover"
      />
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
        <p className="text-xs text-muted-light mt-1">
          {timeAgo(reply.createdAt)}
        </p>
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
        <button
          onClick={() => onReplyClick(review._id)}
          className="btn btn-ghost btn-xs gap-1"
        >
          <FiMessageSquare size={13} /> Reply
        </button>
        <button
          onClick={() => onReport(review._id)}
          className="btn btn-ghost btn-xs gap-1 text-warning"
        >
          <FiFlag size={13} /> Report
        </button>
        {role === "customer" && (
          <>
            <button
              onClick={() => onEditReview(review)}
              className="btn btn-ghost btn-xs gap-1"
            >
              <FiEdit2 size={13} /> Edit
            </button>
            <button
              onClick={() => onDeleteReview(review._id)}
              className="btn btn-ghost btn-xs gap-1 text-error"
            >
              <FiTrash2 size={13} /> Delete
            </button>
          </>
        )}
        {role === "admin" && (
          <button
            onClick={() => onDeleteReview(review._id)}
            className="btn btn-ghost btn-xs gap-1 text-error"
          >
            <FiTrash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default function Reviews() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("All");
  const [modal, setModal] = useState(null); // { mode: "reply" | "report", reviewId }
  const [editing, setEditing] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const { role, user } = useViewer();

  const queryFn = async () => {
    const call =
      role === "admin"
        ? getAllReviewsAdmin
        : role === "farmer"
          ? getFarmerReviews
          : getMyReviews;
    return (await call()).data.reviews;
  };

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", role],
    queryFn,
    enabled: role !== "guest",
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["reviews", role] });

  const filtered = reviews.filter((review) => {
    if (tab === "Farms") return !!review.farm;
    if (tab === "Products") return !!review.product;
    return true;
  });

  const handleEditSubmit = async ({ rating, comment }) => {
    try {
      await updateReview(editing._id, { rating, comment });
      invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(null);
    }
  };

  const handleReplySubmit = async (message) => {
    try {
      await addReviewReply(modal.reviewId, message);
      invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setModal(null);
    }
  };

  const handleReportSubmit = async (message) => {
    try {
      await reportReview(modal.reviewId, message);
      invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setModal(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      if (role === "admin") {
        await adminDeleteReview(reviewId);
      } else {
        await deleteReview(reviewId);
      }
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await deleteReply(reviewId, replyId);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineReplySubmit = async (reviewId, message) => {
    try {
      await addReviewReply(reviewId, message);
      invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setReplyingTo(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold">Reviews</h1>
          <span className="badge badge-sm bg-primary-soft text-primary border-none">
            {filtered.length}
          </span>
        </div>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <FiStar className="text-4xl mb-3" />
            <p>No reviews here yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                role={role}
                isReplying={replyingTo === review._id}
                onReplyClick={(id) =>
                  setReplyingTo(id === replyingTo ? null : id)
                }
                onReplyCancel={() => setReplyingTo(null)}
                onReplySubmit={(msg) =>
                  handleInlineReplySubmit(review._id, msg)
                }
                onReport={(reviewId) => setModal({ mode: "report", reviewId })}
                onDeleteReview={handleDeleteReview}
                onDeleteReply={handleDeleteReply}
                onEditReview={setEditing}
                currentUserId={user?._id}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <MessageModal
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSubmit={
            modal.mode === "reply" ? handleReplySubmit : handleReportSubmit
          }
        />
      )}
      {editing && (
        <EditReviewModal
          review={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
