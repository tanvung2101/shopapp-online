import { Op } from "sequelize";
import db from "../models/index.js";
import { OrderStatus } from "../constants/index.js";
import moment from "moment";
import querystring from "qs";
import crypto from "crypto";



function sortObject(obj) {
  return Object.entries(obj)
    .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
    .reduce((result, item) => {
      result = {
        ...result,
        [item[0]]: encodeURIComponent(item[1].toString().replace(/ /g, "+")),
      };

      return result;
    }, {});
}
function generateSecureHash(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .filter((key) => key !== "vnp_SecureHash")
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHmac("sha512", secret).update(queryString).digest("hex");
}

export async function getCarts(req, res) {
  // const { session_id, user_id, page = 1 } = req.body;
  const user_id = req.user?.id;
  // const pageSize = 10;
  // const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (user_id) whereClause.user_id = user_id;

  const [carts] = await db.Cart.findAll({
    where: whereClause,
    include: [
      {
        model: db.CartItem,
        as: "cart_items",
        include: [
          {
            model: db.Product, // Thêm model Product vào để lấy thông tin sản phẩm
            as: "product",
          },
        ],
      },
    ],
    // limit: pageSize,
    // offset,
  })
  return res.status(200).json({
    message: "Lấy danh sách giỏ hàng thành công",
    data: carts,
    // current_page: parseInt(page, 10),
    // total_pages: Math.ceil(totalCarts / pageSize),
    // total: totalCarts,
  });
}

export async function getCartById(req, res) {
  console.log("hello", req.user)
  const { id } = req.params;
  const userId = req.user?.id;
  const cart = await db.Cart.findByPk(id, {
    include: [
      {
        model: db.CartItem,
        as: "cart_items",
        include: [
          {
            model: db.Product, // Thêm model Product vào để lấy thông tin sản phẩm
            as: "product",
          },
        ],
      },
    ],
  });
  if (!cart) {
    return res.status(404).json({ message: "Giỏ hàng không tìm thấy" });
  }
  if (cart.user_id !== userId) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền truy cập giỏ hàng này" });
  }
  res
    .status(200)
    .json({ message: "Lấy thông tin giỏ hàng thành công", data: cart });
}

export async function insertCart(req, res) {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "Phải cung cấp user_id",
    });
  }

  const [cart, created] = await db.Cart.findOrCreate({
    where: { user_id },
    defaults: { user_id },
  });

  return res.status(created ? 201 : 200).json({
    message: created ? "Tạo giỏ hàng thành công" : "Giỏ hàng đã tồn tại",
    data: cart,
  });
}


// export async function checkoutCart(req, res) {
//   const { cart_id, total, note } = req.body
//   const transaction = await db.sequelize.transaction();
//   try {
//     // verify the cart exits and has item
//     const cart = await db.Cart.findByPk(cart_id, {
//       include: [
//         {
//           model: db.CartItem,
//           as: 'cart_items',
//           include: [
//             {
//               model: db.Product,
//               as: 'product'
//             }
//           ]
//         },
//       ],
//     });
//     if (!cart || !cart.cart_items) {
//       return res.status(404).json({
//         message: "Giỏ hàng không tồn tại hoặc giỏ hàng không có sản phẩm",
//       });
//     }
//     console.log(cart.session_id)

//     // Create an order
//     const newOrder = await db.Order.create(
//       {
//         user_id: cart.user_id,
//         session_id: cart.session_id,
//         status: OrderStatus.Pending,
//         total:
//           total ||
//           cart.cart_items.reduce(
//             (acc, item) => acc + item.quantity * item.product.price,
//             0
//           ),
//         note,
//       },
//       { transaction: transaction }
//     );
//     console.log(newOrder.session_id, newOrder.status)

//     for (let item of cart.cart_items){
//       await db.OrderDetail.create({
//         order_id: newOrder.id,
//         product_id: item.product_id,
//         quantity: item.quantity,
//         price: item.product.price
//       }, {transaction})
//     }

//     // delete cart and its items
//     await db.CartItem.destroy(
//       {
//         where: {
//           cart_id,
//         },
//       },
//       { transaction: transaction }
//     );
//     await cart.destroy({ transaction });

//     await transaction.commit();

//     return res
//       .status(201)
//       .json({
//         message: "Thanh toán giỏ hàng thành công",
//         data:newOrder
//       });
//   } catch (error) {
//     // rollback transaction on error
//     await transaction.rollback();
//     return res.status(404).json({
//       message: "Lỗi khi thanh toán giỏ hàng",
//       error: error.message,
//     });
//   }
// }

export async function checkoutCart(req, res) {
  const { cart_id, total, note, payment, bankCode, cart_item_ids } = req.body;


  try {
    const cart = await db.Cart.findByPk(cart_id, {
      include: [
        {
          model: db.CartItem,
          as: "cart_items",
          include: [{ model: db.Product, as: "product" }],
        },
      ],
    });

    if (!cart || !cart.cart_items) {
      return res.status(404).json({
        message: "Giỏ hàng không tồn tại hoặc không có sản phẩm",
      });
    }

    const selectedCartItems = cart.cart_items.filter(item => cart_item_ids.includes(item.id));

    if (selectedCartItems.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất một sản phẩm để thanh toán" });
    }

    const finalTotal = total || selectedCartItems.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    // Xử lý thanh toán tiền mặt
    if (payment === 1) {
      const transaction = await db.sequelize.transaction();
      try {
        const newOrder = await db.Order.create(
          {
            user_id: cart.user_id,
            session_id: cart.session_id,
            status: OrderStatus.Pending,
            total: finalTotal,
            note,
          },
          { transaction }
        );

        for (let item of selectedCartItems) {
          await db.OrderDetail.create(
            {
              order_id: newOrder.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product.price,
            },
            { transaction }
          );
        }

        await db.CartItem.destroy({ where: { id: cart_item_ids } }, { transaction });
        const remainingItems = cart.cart_items.filter(
          item => !cart_item_ids.includes(item.id)
        );

        if (remainingItems.length === 0) {
          await cart.destroy({ transaction });
        }
        await transaction.commit();

        return res.status(201).json({
          message: "Thanh toán tiền mặt thành công",
          data: newOrder,
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    // Xử lý thanh toán qua VNPay
    const vnp_TmnCode = "WY8057CV";
    const vnp_HashSecret = "RI7HK0UWJOG0TMI9UB4W7CZ53YEQOUA1";
    const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl = "http://localhost:3000/vnpay_return";

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket?.remoteAddress;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: cart_id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng ${cart_id}`,
      vnp_OrderType: "other",
      vnp_Amount: finalTotal * 100,
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      vnp_BankCode: bankCode,
    };

    // Sắp xếp tham số trước khi ký
    vnp_Params = sortObject(vnp_Params);

    // Ký dữ liệu
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac
      .update(new Buffer.from(signData, "utf-8"))
      .digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // Tạo URL thanh toán
    const paymentUrl = `${vnp_Url}?${querystring.stringify(vnp_Params, {
      encode: false,
    })}`;

    return res.status(200).json({
      data: paymentUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi thanh toán giỏ hàng",
      error: error.message,
    });
  }
}


export async function deleteCart(req, res) {
  const { id } = req.params;
  const deleted = await db.Cart.destroy({ where: { id } });
  return res.status(200).json({
    message: deleted ? "Xóa giỏ hàng thành công" : "Giỏ hàng không tìm thấy",
  });
}


export async function paymentSuccess(req, res) {
  const vnp_Params = req.query;
  const vnp_HashSecret = "RI7HK0UWJOG0TMI9UB4W7CZ53YEQOUA1";

  // Xác thực chữ ký bảo mật
  const secureHash = vnp_Params.vnp_SecureHash;
  const calculatedHash = generateSecureHash(vnp_Params, vnp_HashSecret);

  if (secureHash !== calculatedHash) {
    return res.status(400).json({ message: "Invalid secure hash" });
  }

  const cart_id = parseInt(vnp_Params.vnp_TxnRef, 10);
  const transactionStatus = vnp_Params.vnp_TransactionStatus;

  // Kiểm tra trạng thái thanh toán
  if (vnp_Params.vnp_ResponseCode === "00" && transactionStatus === "00") {
    const transaction = await db.sequelize.transaction();
    try {
      // Kiểm tra đơn hàng
      const cart = await db.Cart.findByPk(cart_id, {
        include: [
          {
            model: db.CartItem,
            as: "cart_items",
            include: [{ model: db.Product, as: "product" }],
          },
        ],
      });

      if (!cart) {
        await transaction.rollback();
        return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
      }

      // Tạo đơn hàng
      const newOrder = await db.Order.create(
        {
          user_id: cart.user_id,
          session_id: cart.session_id,
          status: "Completed",
          total: parseInt(vnp_Params.vnp_Amount, 10) / 100,
          note: "Thanh toán VNPay",
          payment_method: "VNPay",
          transaction_no: vnp_Params.vnp_TransactionNo,
        },
        { transaction }
      );

      // Lưu chi tiết đơn hàng
      for (let item of cart.cart_items) {
        await db.OrderDetail.create(
          {
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product.price,
          },
          { transaction }
        );
      }

      // Xóa giỏ hàng sau khi thanh toán thành công
      await db.CartItem.destroy({ where: { cart_id } }, { transaction });
      await cart.destroy({ transaction });

      await transaction.commit();

      return res.redirect(`/order-success?order_id=${newOrder.id}`);
    } catch (error) {
      await transaction.rollback();
      console.error("Lỗi xử lý thanh toán VNPay:", error);
      return res.status(500).json({ message: "Lỗi xử lý đơn hàng" });
    }
  } else {
    return res.status(400).json({
      message: "Giao dịch không thành công",
      data: vnp_Params,
    });
  }
}