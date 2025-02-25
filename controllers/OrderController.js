import { OrderStatus } from "../constants";
import db from "../models";
import { Sequelize, Op, where } from "sequelize";

export async function getOrders(req, res) {
  const { search = "", page = 1, status } = req.query;
  const pageSize = 10; // Number of items per page
  const offset = (page - 1) * pageSize;
  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [{ note: { [Op.like]: `%${search}%` } }],
    };
  }
console.log("haha",db.Order)
  if (status) {
    whereClause.status = status;
  }

  const [orders, totalOrder] = await Promise.all([
    db.Order.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      // order: [["created_at", "DESC"]],
    }),
    db.Order.count({
      where: whereClause,
    }),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách đơn hàng thành công",
    data: orders,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalOrder / pageSize),
    totalOrder,
  });
}

export async function getOrderById(req, res) {
  const { id } = req.params;
  const order = await db.Order.findByPk(id, {
    include: [
      {
        model: db.OrderDetail,
        as: "order_details",
      },
    ],
  });
  if (!order) {
    return res.status(404).json({
      message: "Đơn hàng không tìm thấy",
    });
  }
  return res.status(200).json({
    message: "Lấy thông tin đơn hàng thành công",
    data: order
  });
}

export async function insertOrder(req, res) {
  const userId = req.body.user_id;

  const user = await db.User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      message: "Người dùng không tồn tại",
    });
  }

  const newOrder = await db.Order.create(req.body);
  if (newOrder) {
    return res.status(200).json({
      message: "Thêm mới đơn hàng thành công",
      data: newOrder,
    });
  } else {
    return res.status(200).json({
      message: "Không thể thêm đơn hàng",
    });
  }
}

export async function deleteOrder(req, res) {
  const { id } = req.params;
  const updated = await db.Order.update({status: OrderStatus.Failed},{
    where: { id },
  });
  if (updated) {
    res.status(200).json({
      message: "xoá đơn hàng thành công",
    });
  } else {
    return res.status(200).json({
      message: "Đơn hàng không tìm thấy",
    });
  }
}

export async function updateOrder(req, res) {
  const { id } = req.params;
  const updatedProduct = await db.Order.update(req.body, {
    where: { id },
  });
  if (updatedProduct) {
    return res.status(200).json({
      message: "update đơn hàng thành công",
    });
  }
  else{
    return res.status(200).json({
      message: "Đơn hàng không tìm thấy",
    });
  }
}
