import { useNavigate } from "react-router";
import { FiMapPin, FiArrowRight } from "react-icons/fi";

const FarmsListCard = ({ farms }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-6">
      <h3 className="text-lg font-bold mb-5">My Farms</h3>

      {farms.length === 0 ? (
        <p className="text-sm text-muted">You haven't added any farms yet.</p>
      ) : (
        <div className="space-y-3">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className="border border-theme-light rounded-field p-3 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-field overflow-hidden shrink-0 bg-base-200">
                {farm.images?.[0]?.url ? (
                  <img
                    src={farm.images[0].url}
                    alt={farm.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-light text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{farm.name}</p>
                <p className="text-xs text-muted flex items-center gap-1 truncate">
                  <FiMapPin size={12} className="shrink-0" />
                  {farm.location?.village}, {farm.location?.upazila}, {farm.location?.district}
                </p>
              </div>

              <button
                onClick={() => navigate(`/farmer/farms/${farm._id}`)}
                className="btn btn-sm btn-outline gap-1 shrink-0"
              >
                View <FiArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmsListCard;