import { Sequelize, Op, where } from "sequelize";
import argon2 from "argon2";
import db from "../models";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import InsertUserRequest from "../dtos/requests/users/InsertUserRequest";

export async function insertUser(req, res) {
  const existingUser = await db.User.findOne({
    where: { email: req.body.email }
  });
  if (existingUser) {
    return res.status(409).json({
          message: "Email đã tồn tại",
        });
  }
  const hashedPassword = await argon2.hash(req.body.password);
  const user = await db.User.create({ ...req.body, password: hashedPassword });
    if (user) {
        return res.status(200).json({
          message: "Thêm mới người dùng thành công",
          data: new ResponseUser(user),
        });
    } else {
        return res.status(400).json({
          message: "Không thể thêm người dùng",
        });
    }
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