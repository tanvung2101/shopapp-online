import path from "path";
import multer from "multer";
import config from "../config/firebaseConfig"

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("Chỉ được phép tải lên file ảnh"), false);
  }
};

const upload = multer({
    //   storage,
    storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fieldSize: 1024 * 1024 * 5, // limit 5mb
  },
});

export default upload
