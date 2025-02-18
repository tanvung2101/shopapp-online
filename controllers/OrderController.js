import db from "../models";

export async function getOrders(req, res) {
  res.status(200).json({
    message: "Lấy danh sách đơn hàng",
  });
}

export async function getOrderById(req, res) {
  res.status(200).json({
    message: "Lấy thông tin đơn hàng thành công",
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
  const deleted = await db.Order.destroy({
    where: { id },
  });
  if (deleted) {
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
