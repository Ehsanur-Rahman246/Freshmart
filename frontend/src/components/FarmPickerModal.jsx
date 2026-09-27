import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { getMyFarms } from "../api/farm";
import Loader from "./Loader";

export default function FarmPickerModal({ open, onClose, onSelect }) {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getMyFarms()
      .then((res) => {
        if (res.data.success) setFarms(res.data.farms);
      })
      .catch(() => alert("Could not load farms"))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4">
      <div className="w-full max-w-md rounded-2xl bg-base-100 border border-theme p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold">Choose a farm</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary"
          >
            <FiX size={20} />
          </button>
        </div>

        {loading && <Loader/>}

        {!loading && farms.length === 0 && (
          <p className="text-sm text-muted">
            You need to add a farm before listing a product.
          </p>
        )}

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {farms.map((farm) => (
            <button
              key={farm._id}
              type="button"
              onClick={() => onSelect(farm)}
              className="text-left px-4 py-3 rounded-xl border border-theme hover:border-primary hover:bg-primary-soft transition"
            >
              <div className="font-bold">{farm.name}</div>
              <div className="text-xs text-muted-light">
                {farm.location?.district}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
