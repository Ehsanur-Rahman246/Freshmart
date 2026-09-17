// Adds a canned farmer reply to a freshly created review, but only when
// the reviewed product/farm belongs to a demo farmer. Real farmers reply
// manually via addReviewReply.
const REPLY_COMMENTS = {
  1: [
    "We're sorry to hear this — please reach out so we can make it right.",
    "Thank you for the feedback, we'll look into this.",
  ],
  2: [
    "Sorry this didn't meet expectations, we're working on it.",
    "Thanks for letting us know, we'll do better.",
  ],
  3: [
    "Thanks for the honest feedback, we appreciate it!",
    "Glad it was okay — we'll keep working to improve.",
    "Thanks for shopping with us!",
  ],
  4: [
    "Thank you so much, glad you enjoyed it!",
    "Really appreciate the kind words, see you again soon!",
    "Thanks for the great feedback!",
  ],
  5: [
    "Thank you so much for the amazing review!",
    "This means a lot to us, thank you!",
    "So glad you loved it — thanks for the support!",
  ],
};

export const maybeAddFarmerReply = async (review, farmer) => {
  if (!farmer || !farmer.isDemo) return;

  const authorId = farmer.user?._id || farmer.user;
  if (!authorId) return;

  const pool = REPLY_COMMENTS[review.rating] || REPLY_COMMENTS[3];
  const message = pool[Math.floor(Math.random() * pool.length)];

  review.replies.push({
    author: authorId,
    authorRole: "farmer",
    message,
  });

  await review.save();
};