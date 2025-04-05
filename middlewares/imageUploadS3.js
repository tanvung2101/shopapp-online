import multer from "multer";
import multerS3 from "multer-s3";
// import s3Client from "../config/s3.js";
// import { S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// const s3 = new S3({ client: s3Client });

const upload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `images/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 1 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ được phép tải lên file ảnh"), false);
    }
  },
});

export default upload;
