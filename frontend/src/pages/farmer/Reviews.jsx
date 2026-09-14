import ReviewsPage from "../../components/review/ReviewsPage";
import RatingSummary from "../../components/review/RatingSummary";

export default function FarmerReviews() {
  return (
    <ReviewsPage
      title="Reviews"
      emptyMessage="No reviews on your farms or products yet."
      renderSummary={(reviews) => <RatingSummary reviews={reviews} />}
    />
  );
}