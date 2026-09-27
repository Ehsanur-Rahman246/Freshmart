import { useState } from "react";
import { FiImage, FiSave } from "react-icons/fi";
import { updateFarm } from "../api/farm";

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
    <section className="rounded-2xl border border-theme bg-base-200 p-6">
      <h2 className="text-lg font-bold mb-4">Farm Photos</h2>

      {error && (
        <p className="mb-4 px-4 py-3 rounded-xl bg-error-soft text-error text-sm font-bold">
          {error}
        </p>
      )}

      {farm?.images?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-light mb-2">Check to remove</p>
          <div className="flex flex-wrap gap-3">
            {farm.images.map((img) => (
              <label
                key={img.publicId}
                className="flex flex-col items-center gap-1"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-20 h-20 object-cover rounded-xl"
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

      <label className="flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-2xl border-2 border-dashed border-theme bg-base-100 cursor-pointer text-muted hover:border-primary hover:bg-primary-soft hover:text-primary">
        <FiImage size={32} />
        <strong className="text-sm font-bold text-base-content">
          Add photos
        </strong>
        <span className="text-xs text-muted-light">
          Select one or more images
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(Array.from(e.target.files))}
          className="hidden"
        />
      </label>

      {newFiles.length > 0 && (
        <p className="mt-4 px-4 py-3 rounded-xl bg-success-soft text-success text-sm font-bold text-center">
          {newFiles.length} image(s) selected
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={
          isSubmitting || (newFiles.length === 0 && removeImageIds.length === 0)
        }
        className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-content font-bold hover:bg-primary-hover disabled:opacity-50"
      >
        <FiSave />
        {isSubmitting ? "Saving..." : "Save Photos"}
      </button>
    </section>
  );
}
