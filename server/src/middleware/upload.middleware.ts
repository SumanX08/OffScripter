import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export const uploadAudio = upload.single("audio");