import { CiLocationOn } from "react-icons/ci";
import { FaStar } from "react-icons/fa6";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFarmReviews } from "../api/review";

const FarmCard = ({ farm, to }) => {
  const { data: reviews = [] } = useQuery({
    queryKey: ["farmReviews", farm._id],
    queryFn: async () => {
      const { data } = await getFarmReviews(farm._id);
      return data.reviews;
    },
    staleTime: 1000 * 60 * 5,
  });

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const image = farm.images?.[0]?.url;
  const location = [farm.location?.upazila, farm.location?.district]
    .filter(Boolean)
    .join(", ");

  return (
    <Link to={to} className="block">
      <div className="w-[calc((100vw-28px)/2)] max-w-50 h-64 flex flex-col bg-base-300 rounded-[10px] shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:[box-shadow:0_14px_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] p-1 my-2 text-left overflow-hidden">
        <div className="w-full h-30 rounded-tl-md rounded-tr-md overflow-hidden bg-base-200">
          {image ? (
            <img
              src={image}
              alt={farm.name}
              loading="lazy"
              className="w-full h-30 object-cover rounded-tl-md rounded-tr-md"
            />
          ) : (
            <div className="w-full h-30 flex items-center justify-center text-muted text-xs">
              No image
            </div>
          )}
        </div>

        <p className="pt-2 ml-1 text-[18px] truncate">{farm.name}</p>

        <div className="flex items-center ml-1 gap-0.5 min-w-0">
          <CiLocationOn className="shrink-0 text-[12px] text-muted" />
          <p className="text-[12px] text-muted truncate">{location || "—"}</p>
        </div>

        <div className="flex items-center ml-1 gap-1 mt-1">
          <FaStar className="text-secondary text-sm" />
          <span className="text-sm">
            {avgRating !== null ? avgRating.toFixed(1) : "No ratings"}
          </span>
          {reviews.length > 0 && (
            <span className="text-xs text-muted-light">({reviews.length})</span>
          )}
        </div>
        <div className="mt-auto pt-2">
          <span className="btn btn-primary btn-sm w-full">View Farm</span>
        </div>
      </div>
    </Link>
  );
};

export default FarmCard;