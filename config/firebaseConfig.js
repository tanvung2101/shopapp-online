// helpers/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Kiểm tra xem đã khởi tạo Firebase chưa (tránh lỗi khi reload nhiều lần)
const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Export getStorage instance để dùng upload, delete, get URL
const storage = getStorage(firebaseApp);

export { firebaseApp, storage };
