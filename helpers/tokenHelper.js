import db from "../models";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

async function getUserFromToken(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Không có token được cung cấp");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    // kiểm tra token sau khi password đã đc cập nhật
    if (
      user.password_changed_at && // issued at
      decoded.iat < new Date(user.password_changed_at).getTime() / 1000
    ) {
      return res.status(401).json({
        message: "Token không hợp lệ do thay đổi mật khẩu",
      });
    }

    return user;
  } catch (error) {
    res.status(401).json({
      message: "Token không hợp lệ hoặc hết hạn",
      error: error.message.toString(),
    });
    return null;
  }
}

export { getUserFromToken };
