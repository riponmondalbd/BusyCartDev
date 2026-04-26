import multer from "multer";

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed"));
    }

    cb(null, true);
  },
});

export default upload;
