export const MAX_IMAGES = 4;

// Only IDs that actually belong to this document may be deleted
export const parseRemoveImages = (raw, existingImages = []) => {
  let ids = raw;

  if (typeof raw === "string") {
    try {
      ids = JSON.parse(raw);
    } catch {
      ids = [];
    }
  }

  if (!Array.isArray(ids)) return [];

  const owned = new Set(existingImages.map((img) => img.publicId));

  return [
    ...new Set(ids.filter((id) => typeof id === "string" && owned.has(id))),
  ];
};
