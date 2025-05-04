
import argon2 from "argon2";
import db from "../models/index.js";
import ResponseUser from "../dtos/responses/user/ResponseUser.js";
import { UserRole } from "../constants/index.js";
import { getAvatarUrl } from "../helpers/imageHelper.js";
import { accessToken, authToken, forgotPasswordToken, verifyRefreshToken } from "../helpers/jwt.js";
import createHttpError from "http-errors";
import { sendForgotPasswordEmail } from "../send-email.js";
import dotenv from 'dotenv';

dotenv.config();

const cookie = {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30days=refreshExpiration
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: true,
};

export async function registerUser(req, res) {
  const { password, phone, email } = req.body;

  if (!email && !phone) {
    return res.status(409).json({
      message: "Cần cung cấp email và số điện thoại",
    });
  }

  if (!password) {
    return res.status(409).json({
      message: "Bạn chưa nhập mật khẩu",
    });
  }

  let condition = {};
  if (email) condition.email = email;
  if (phone) condition.phone = phone;

  const existingUser = await db.User.findOne({
    where: condition,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email hoặc số điện thoại đã tồn tại",
    });
  }
  const hashedPassword = await argon2.hash(password);
  const user = await db.User.create({
    ...req.body,
    email,
    phone,
    password: hashedPassword,
    role: UserRole.USER,
  });
  if (user) {
    return res.status(200).json({
      message: "Đăng kí người dùng thành công",
      data: new ResponseUser(user),
    });
  } else {
    return res.status(400).json({
      message: "Không thể đăng kí",
    });
  }
}

// export async function loginUser(req, res) {
//   const { email, password } = req.body;
//   // console.log('email',email)

//   if (!email ) {
//     return res.status(400).json({
//       message: "Cần cung cấp email",
//     });
//   }

//   if (!password) {
//     return res.status(400).json({
//       message: "Bạn chưa nhập mật khẩu",
//     });
//   }

//   let condition = {};
//   if (email) condition.email = email;
//   // if (phone) condition.phone = phone;

//   const user = await db.User.findOne({ where: condition });

//   // console.log("user",user)
//   if (!user) {
//     return res.status(400).json({
//       message: "Email chưa được đăng kí",
//     });
//   }

//   const isPasswordValid = await argon2.verify(user.password, password);
//   if (!isPasswordValid) {
//     return res.status(401).json({
//       message: "Mật khẩu không chính xác",
//     });
//   }

//   const { access_token, refresh_token } = await authToken(user.id);
//   res.cookie("refresh_token", refresh_token, cookie);

//   return res.status(200).json({
//     message: "Đăng nhập thành công",
//     data: new ResponseUser(user),
//     access_token,
//   });
// }

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Cần cung cấp email" });
    }

    if (!password) {
      return res.status(400).json({ message: "Bạn chưa nhập mật khẩu" });
    }

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Email chưa được đăng ký" });
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }

    console.log('user', user)

    const { access_token, refresh_token } = await authToken(user.id);

    console.log('access_token', access_token,refresh_token)
    res.cookie("refresh_token", refresh_token, cookie);


    return res.status(200).json({
      message: "Đăng nhập thành công",
      data: new ResponseUser(user),
      access_token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại sau." });
  }
}


export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, avatar, old_password, new_password, phone } = req.body;

  if (req.user.id != id) {
    return res.status(403).json({
      message: "Không được cập nhật thông tin của người khác",
    });
  }
  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng",
    });
  }

  if (old_password && new_password) {
    const passwordValid = await argon2.verify(user.password, old_password);
    if (!passwordValid) {
      return res.status(401).json({
        message: "Mật khẩu cũ không chính xác",
      });
    }

    user.password = await argon2.hash(new_password);
    user.password_changed_at = new Date();
  } else if (new_password || old_password) {
    return res.status(401).json({
      message: "Cần cả mật khẩu mới và mật khẩu cũ để cập nhật",
    });
  }

  user.name = name || user.name;
  user.avatar = avatar || user.avatar;
  user.phone = phone || user.phone;

  await user.save();

  user.avatar = getAvatarUrl(user.avatar);

  return res.status(200).json({
    message: "Cập nhật người dùng thành công",
    data: user,
  });
}

// const updateUserPasswordById = async (userId, body) => {
//   const user = await getUserById(userId);

//   if (!user) throw createError.NotFound();

//   Object.assign(user, body);

//   await user.save();

//   return user;
// };

// 1418
export async function getUserById(req, res) {
  const { id } = req.params;

  if (req.user.id != id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      message:
        "Chỉ có người dùng hoặc quản trị viên mới có quyền xem thông tin này",
    });
  }

  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng",
    });
  }

  user.avatar = getAvatarUrl(user.avatar);
  return res.status(200).json({
    message: "Cập nhật người dùng thành công",
    data: new ResponseUser(user),
  });
}


export async function getRefreshToken(req, res, next) {
  //  refreshToken
  const refreshToken = req.signedCookies.refresh_token;
  if (!refreshToken) return next(createHttpError.BadRequest("Please sign in."));

  // verify token
  const { id } = await verifyRefreshToken(refreshToken);

  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  if (!user) return next(createHttpError.NotFound("Not found user."));

  // create access token
  const { access_token, refresh_token } = await authToken(user.id);

  // store refresh token
  res.cookie("refresh_token", refresh_token, cookie);


  res.send({ data: new ResponseUser(user), access_token });
};

export async function forgotPassword (req, res, next) {
  // check email
  const user = await db.User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!user) return next(createHttpError.NotFound("Email chưa được đăng kí"));

  const forgot_token = await forgotPasswordToken(user.id);
  user.reset_token_created_at = new Date();
  await user.save();

  // send email
  // await emailService.sendEmailResetPassword(
  //   req.body.email,
  //   ac_token,
  //   user.name
  // );
  await sendForgotPasswordEmail(user.email, forgot_token);
  // success
  res.send({ message: "Email đặt lại mật khẩu đã được gửi" });
};


export async function restPassword(req, res) {
  const { id } = req.decoded
  const { password } = req.body;
  if (!password) {
    return res.status(404).json({
      message: "Vui lòng nhập mật khẩu",
    });
  }
  const hashedPassword = await argon2.hash(password);
  const user = await db.User.findByPk(id);
  user.password = hashedPassword
  user.password_changed_at = new Date();
  user.save()
  // if (!user) return next(createHttpError.NotFound("Email chưa được đăng kí"));

  // const access_token = await accessToken(user.id);

  // send email
  // await emailService.sendEmailResetPassword(
  //   req.body.email,
  //   ac_token,
  //   user.name
  // );

  // success
  res.send({ message: "ok",  user:new ResponseUser(user),});
};

export async function logout(req, res){
  // clear cookie
  res.clearCookie('refresh_token')
  // success
  res.send({ message: "Đăng xuất thành công" })
}