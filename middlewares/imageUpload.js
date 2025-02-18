import path from 'path'
import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const destinationPath = path.join(__dirname, "../uploads/");
    callback(null, destinationPath);
  },
  filename: function (req, file, callback) {
    const newFileName = `${Date.now()}-${file.originalname}`;
    callback(null, newFileName);
  },
})

// Cấu hình filter chỉ cho phép file ảnh
const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true)
    } else {
        callback(new Error('Chỉ được phép tải lên file ảnh'), false)
    }
}

const upload = multer({
  storage,
    fileFilter,
    limits: {
      fieldSize: 1024 * 1024 * 5 // limit 5mb
  }
});

export default upload;

