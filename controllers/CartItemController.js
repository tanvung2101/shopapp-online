
import db from "../models/index.js";

export async function getCartItems(req, res) {
  const { cart_id, page = 1 } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (cart_id) whereClause.cart_id = cart_id;

  const [cartItems, totalCartItems] = await Promise.all([
    db.CartItem.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
    }),
    db.CartItem.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách giỏ hàng thành công",
    data: cartItems,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalCartItems / pageSize),
    totalCartItems,
  });
}

export async function getCartItemById(req, res) {
  const { id } = req.params;
  const cartItem = await db.CartItem.findByPk(id);
  if (!cartItem) {
    return res
      .status(404)
      .json({ message: "Mục trong giỏ hàng không tìm thấy" });
  }
  return res
    .status(200)
    .json({ message: "Lấy thông tin mục giỏ hàng thành công", data: cartItem });
}

export async function getCartItemByCartId(req, res) {
  const { cart_id } = req.params;
  console.log("cart_id", cart_id);

  const cartItems = await db.CartItem.findAll({
    where: { cart_id },
  });

  return res.status(200).json({
    message: "Lấy thông tin mục giỏ hàng thành công",
    data: cartItems,
  });
}

export async function insertCartItems(req, res) {
  const { product_id, quantity, cart_id } = req.body;
  const productExits = await db.Product.findByPk(product_id);
  if (!productExits) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  // kiểm tra số lương
  if (productExits.quantity < quantity) {
    return res.status(400).json({
      message: "Sản phẩm không đủ số lượng yêu cầu",
    });
  }

  const cartExits = await db.Cart.findByPk(cart_id);
  if (!cartExits) {
    return res.status(404).json({
      message: "Giỏ hàng không tồn tại",
    });
  }

  // Tìm kiếm giỏ hàng có sẵn
  const existingCartItem = await db.CartItem.findOne({
    where: {
      product_id,
      cart_id,
    },
  });

  if (existingCartItem) {
    if (quantity === 0) {
      await existingCartItem.destroy();
      return res.status(201).json({
        message: "Mục trong giỏ hàng đã được xoá",
      });
    } else {
      existingCartItem.quantity = quantity + existingCartItem.quantity;
      await existingCartItem.save();
      return res.status(201).json({
        message: "Cập nhật số lượng trong giỏ hàng thành công",
        data: existingCartItem,
      });
    }
  } else {
    if (quantity > 0) {
      const newCartItem = await db.CartItem.create(req.body);
      return res.status(201).json({
        message: "Thêm mới mục trong giỏ hàng thành công",
        data: newCartItem,
      });
    }
  }
}

export async function deleteCartItem(req, res) {
  const { id } = req.params;
  const deleted = await db.CartItem.destroy({ where: { id } });

  if (!deleted) {
    return res.status(200).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
  return res.status(200).json({
    message: "Xóa sản phẩm khỏi giỏ hàng thành công",
  });
}

export async function updateCartItem(req, res) {
  const { id } = req.params;
  const updated = await db.CartItem.update(req.body, { where: { id } });
  return res.status(200).json({
    message: updated
      ? "Cập nhật sản phẩm trong giỏ hàng thành công"
      : "Sản phẩm không tìm thấy",
  });
}
