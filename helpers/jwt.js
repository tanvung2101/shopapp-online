import jwt from "jsonwebtoken";
import db from "../models";

const generateToken = (payload, secretSignature, tokenLife) => {
  console.log("process.env.JWT_EXPIRATION", tokenLife);
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secretSignature,
      { expiresIn: tokenLife },
      (error, token) => {
        if (error) {
          return error.message;
        }
        resolve(token);
      }
    );
  });
};

const refreshToken = async (userId) => {
  return generateToken(
    { id: userId },
    // config.jwt.refreshSecret,
    // config.jwt.refreshExpiration
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRATION
  );
};

const accessToken = async (userId) => {
  return generateToken(
    { id: userId, iat: Math.floor(Date.now() / 1000) },
    // config.jwt.accessSecret,
    // config.jwt.accessExpiration
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRATION
  );
};

const forgotPasswordToken = async (userId) => {
  return generateToken(
    { id: userId },
    // config.jwt.refreshSecret,
    // config.jwt.refreshExpiration
    process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
    process.env.JWT_FORGOT_PASSWORD_EXPIRATION
  );
};

const authToken = async (userId) => {
  const [access_token, refresh_token] = await Promise.all([
    accessToken(userId),
    refreshToken(userId),
  ]);
  return {
    access_token,
    refresh_token,
  };
};

const resetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);

  if (!user) throw httpError.BadRequest(transErrors.email_undefined);

  const token = await generateToken(
    { id: user.id },
    // config.jwt.resetPasswordSecret,
    // config.jwt.resetPasswordExpiration
    process.env.JWT_RESET_PASSWORD_SECRET,
    process.env.JWT_RESET_PASSWORD_EXPIRATION
  );

  return token;
};

const verifyRefreshToken = async (token) => {
  //   return await verifyToken(token, process.env.JWT_REFRESH_SECRET);
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  return decoded;
};

const verifyForgotPasswordToken = async (req, res, next) => {
  try {
    // Lấy token từ headers hoặc body
    const token = req.body.forgot_password_token;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid or expired token." });
        }

        // Thêm email vào request để sử dụng ở bước tiếp theo
        const user = await db.User.findByPk(decoded.id);
        const resetTokenCreatedAt =
          new Date(user.reset_token_created_at).getTime() / 1000;
        if (decoded.iat < resetTokenCreatedAt) {
          return res
            .status(401)
            .json({ message: "Token đã bị vô hiệu hóa, vui lòng yêu cầu lại" });
        }
        req.decoded = decoded;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export {
  generateToken,
  refreshToken,
  accessToken,
  authToken,
  resetPasswordToken,
  verifyRefreshToken,
  verifyForgotPasswordToken,
  forgotPasswordToken,
};
