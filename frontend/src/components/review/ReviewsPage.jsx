import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiStar, FiX } from "react-icons/fi";
import { useViewer } from "../../hooks/useViewer";
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
} from "../../api/review";
import ReviewCard from "./ReviewCard";

const TABS = ["All", "Farms", "Products"];

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
                className={n <= rating ? "fill-current text-secondary" : "text-muted-light"}
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
          <button onClick={() => onSubmit({ rating, comment })} className="btn btn-sm btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// role-agnostic — picks the right fetch by viewer role.
// renderSummary(reviews): optional, receives the full unfiltered list,
// rendered above the tab bar (used by farmer/Reviews.jsx for RatingSummary).
export default function ReviewsPage({
  title = "Reviews",
  emptyMessage = "No reviews here yet.",
  renderSummary,
}) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("All");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const { role, user } = useViewer();

  const queryFn = async () => {
    const call =
      role === "admin" ? getAllReviewsAdmin : role === "farmer" ? getFarmerReviews : getMyReviews;
    return (await call()).data.reviews;
  };

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", role],
    queryFn,
    enabled: role !== "guest",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["reviews", role] });

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
          <h1 className="text-xl font-extrabold">{title}</h1>
          <span className="badge badge-sm bg-primary-soft text-primary border-none">
            {filtered.length}
          </span>
        </div>

        {renderSummary && reviews.length > 0 && renderSummary(reviews)}

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
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                role={role}
                isReplying={replyingTo === review._id}
                onReplyClick={(id) => setReplyingTo(id === replyingTo ? null : id)}
                onReplyCancel={() => setReplyingTo(null)}
                onReplySubmit={(msg) => handleInlineReplySubmit(review._id, msg)}
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
          onSubmit={modal.mode === "reply" ? handleReplySubmit : handleReportSubmit}
        />
      )}
      {editing && (
        <EditReviewModal review={editing} onClose={() => setEditing(null)} onSubmit={handleEditSubmit} />
      )}
    </div>
  );
}