import { getUserFromToken } from "../helpers/tokenHelper.js";

const requireRoles = (roleRequired) => async (req, res, next) => {
  try {
    const user = await getUserFromToken(req, res);

    if (!user) return;

    if (user.is_locked === 1) {
      return res.status(403).json({
        message: "Tài khoản này đã bị khoá",
      });
    }

    if (!roleRequired.includes(user.role)) {
      return res.status(403).json({
        message: "Không có quyền truy cập",
      });
    }

    req.user = user;
    next();
  } catch (error) {
       res.status(401).json({
      error: error.message,
    });
  }

};

export { requireRoles };
