import { useQuery } from "@tanstack/react-query";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { getFarmerReviews } from "../../../api/review";
import { Link } from "react-router";

const AvgReviewCard = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", "farmer"],
    queryFn: async () => (await getFarmerReviews()).data.reviews,
  });

  const total = reviews.length;
  const avg = total
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : 0;

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-6 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold mb-1">Overall Rating</h3>
        <p className="text-xs text-muted">Across all farms and products</p>
      </div>
      {isLoading ? (
        <span className="loading loading-spinner loading-sm text-primary" />
      ) : (
        <div className="flex flex-col justify-between">
        <Link to={"/farmer/reviews"}><button className="btn btn-ghost btn-sm">All Reviews <FiArrowRight/></button></Link>
        <div className="flex flex-1 items-center gap-2 justify-center">
          <FiStar className="fill-current text-secondary" size={22} />
          <span className="text-2xl font-extrabold">{avg}</span>
          <span className="text-sm text-muted-light">({total})</span>
        </div>
        </div>
      )}
    </div>
  );
};

export default AvgReviewCard;