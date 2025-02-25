import { Sequelize, Op, where } from "sequelize";
import argon2 from "argon2";
import db from "../models";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import { UserRole } from "../constants";
import jwt from "jsonwebtoken";
require('dotenv').config();

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
    email
    , phone, password: hashedPassword, role: UserRole.USER
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


export async function loginUser(req, res) {
  const { email, phone, password } = req.body;

  if (!email && !phone) {
    return res.status(400).json({
      message: "Cần cung cấp email hoặc số điện thoại",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Bạn chưa nhập mật khẩu",
    });
  }

  let condition = {};
  if (email) condition.email = email;
  if (phone) condition.phone = phone;

  const user = await db.User.findOne({ where: condition });

  if (!user) {
    return res.status(401).json({
      message: "Tên hoặc mật khẩu không chính xác",
    });
  }

  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Tên hoặc mật khẩu không chính xác",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      // role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  return res.status(200).json({
    message: "Đăng nhập thành công",
    data: new ResponseUser(user),
    token
  });
}


export async function updateProducts(req, res) {
  const { id } = req.params;
  const [updated] = await db.User.update(req.body, {
    where: { id },
  });
  if (updated) {
    res.status(200).json({
      message: "Cập nhật người dùng thành công",
    });
  } else {
    return res.status(404).json({
      message: "Người dùng không tìm thấy",
    });
  }
}
