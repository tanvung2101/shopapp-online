// helpers/s3.js
const { S3 } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// CommonJS có sẵn __dirname và __filename
// nếu muốn đường dẫn đến file hiện tại
// const __filename = __filename;
// const __dirname = __dirname;

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// s3.listBuckets().then(data => console.log(data));

const ImageUploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 1 }, // Giới hạn 1MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ được phép tải lên file ảnh"), false);
    }
  },
});

// CommonJS export
module.exports = {
  s3,
  default: ImageUploadS3,
};
