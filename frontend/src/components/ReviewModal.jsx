import { useState } from "react";
import { FiStar, FiX } from "react-icons/fi";

const ReviewModal = ({
  title = "Write a review",
  initialRating = 0,
  initialComment = "",
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-box p-5 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
            <FiX size={16} />
          </button>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
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
            disabled={rating < 1 || submitting}
            className="btn btn-sm btn-primary"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
