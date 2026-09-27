import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }

    const error = new Error("Only JPG, PNG, WEBP or AVIF images are allowed");
    error.status = 400;
    cb(error);
  },
});
