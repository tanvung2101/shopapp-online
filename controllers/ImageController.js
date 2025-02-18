import fs from "fs";
import path from "path";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import db from "../models";

export async function uploadImages(req, res) {
  // Kiểm tra nếu không có file nào được tải lên
  if (req.files.length === 0) {
    throw new Error("Không có file nào được tải lên");
  }
  const uploadImagesPaths = req.files.map((file) => path.basename(file.path).trim());
  res.status(201).json({
    message: "Tải file ảnh thành công",
    files: uploadImagesPaths,
  });
}

export async function uploadImagesToGoogleStorage(req, res) {
  // Kiểm tra nếu không có file nào được tải lên
  if (!req.file) {
    throw new Error("Không có file nào được tải lên");
  }
  const storage = getStorage();
  const newFileName = `${Date.now()}-${req.file.originalname}`;
  const storageRef = ref(storage, `images/${newFileName}`);
  // Upload the file and metadata
  const snapshot = uploadBytesResumable(storageRef, req.file.buffer, {
    contentType: req.file.mimetype,
  });
  const downloadUrl = await getDownloadURL((await snapshot).ref);
  res.status(201).json({
    message: "Tải file ảnh thành công",
    file: downloadUrl.trim(),
  });
}

async function checkImageInUser(imageUrl) {
  const models = [
    { model: db.User, field: "avatar" },
    { model: db.Category, field: "image" },
    { model: db.Brand, field: "image" },
    { model: db.Product, field: "image" },
    { model: db.News, field: "image" },
    { model: db.Banner, field: "image" },
  ];

  for (let { model, field } of models) {
    const result = await model.findOne({ where: { [field]: imageUrl } });
    if (result) return true;
  }
  return false;
}


export async function deleteImage(req, res) {
  const { url: rawUrl } = req.body;
  const url = rawUrl.trim();
  try {
    if (await checkImageInUser(url)) {
      return res.status(500).json({ message: "Ảnh vẫn đang được sử dụng trong cơ sở dữ liệu " });
    }
    if (url.includes("https://firebasestorage.googleapis.com/")) {
      const storage = getStorage();
      const fileRef = ref(storage, url);

      // xoá ảnh trong firebase
      await deleteObject(fileRef);
      return res.status(200).json({ message: "Ảnh đã được xoá thành công" });
    } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
      console.log("hahaa")
      const filePath = path.join(__dirname, "../uploads/", path.basename(url));
      console.log("filePath", filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ message: "Ảnh đã được xoá thành công" });
    } else {
      return res.status(400).json({ message: "URL không hợp lệ" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi xoá ảnh", error: error.message });
  }
}



export async function viewImages(req, res) {
  const { fileName } = req.params;
  const imagePath = path.join(path.join(__dirname, "../uploads/"), fileName);
  // Check if the files exists
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(imagePath);
  });
}
