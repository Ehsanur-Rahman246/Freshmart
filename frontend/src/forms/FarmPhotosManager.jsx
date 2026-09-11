import { useState } from "react";
import { updateFarm } from "../api/farm";

// farm: existing farm doc (must already exist — call this only once the
// farm has an _id, i.e. after FarmDetailsForm's create step succeeds)
export default function FarmPhotosManager({ farm, onSuccess }) {
  const [newFiles, setNewFiles] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleRemoveImage = (publicId) => {
    setRemoveImageIds((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId],
    );
  };

  const handleSave = async () => {
    if (newFiles.length === 0 && removeImageIds.length === 0) return;

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      newFiles.forEach((file) => formData.append("images", file));

      if (removeImageIds.length > 0) {
        formData.append("removeImages", JSON.stringify(removeImageIds));
      }

      const response = await updateFarm(farm._id, formData);

      setNewFiles([]);
      setRemoveImageIds([]);
      onSuccess?.(response.data.farm);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {farm?.images?.length > 0 && (
        <div>
          <label>Current Photos (check to remove)</label>
          <div className="flex flex-wrap gap-3">
            {farm.images.map((img) => (
              <label
                key={img.publicId}
                className="flex flex-col items-center gap-1"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />
                <input
                  type="checkbox"
                  checked={removeImageIds.includes(img.publicId)}
                  onChange={() => toggleRemoveImage(img.publicId)}
                />
                <span className="text-xs">Remove</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label>Add Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(Array.from(e.target.files))}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={
          isSubmitting || (newFiles.length === 0 && removeImageIds.length === 0)
        }
      >
        {isSubmitting ? "Saving..." : "Save Photos"}
      </button>
    </div>
  );
}
