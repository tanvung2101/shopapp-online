import { Op } from "sequelize";
import db from "../models";

export async function getProductImages(req, res) {
  const { product_id, page = 1 } = req.query;
  const pageSize = 10; // Number of items per page
  const offset = (page - 1) * pageSize;
  let whereClause = {};
  if (product_id) {
    whereClause.product_id = product_id;
  }
  const [productImages, totalProductImages] = await Promise.all([
    db.ProductImage.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      include: [{ model: db.Product, as: "Product" }],
    }),
    db.ProductImage.count({
      where: whereClause,
    }),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách ảnh thành công",
    data: productImages,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalProductImages / pageSize),
    totalProductImages,
  });
}

export async function getProductImageById(req, res) {
  const { id } = req.params;
  const productImage = await db.ProductImage.findByPk(id);
  if (!productImage) {
    return res.status(404).json({
      message: "Không tìm thấy ảnh",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin ảnh thành công",
    data: productImage,
  });
}

export async function insertProductImage(req, res) {
  const { product_id, image_url } = req.body;
  const product = await db.Product.findByPk(product_id);
  if (!product) {
    return res.status(201).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
  // kiểm tra cặp product_id và image_url đã tồn tại trong db productImage chưa
  const existingImage = await db.ProductImage.findOne({
    where: {
      product_id,
      image_url,
    },
  });
  if (existingImage) {
    return res.status(409).json({
      message: "Ảnh đã được liên kết với sản phẩm khác",
      data: productImages,
    });
  }
  const productImages = await db.ProductImage.create(req.body);
  return res.status(201).json({
    message: "Thêm mới ảnh sản phẩm thành công",
    data: productImages,
  });
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  const deleted = await db.ProductImage.destroy({
    where: { id },
  });
  if (deleted) {
    res.status(200).json({
      message: "xoá ảnh thành công",
    });
  } else {
    res.status(404).json({
      message: "Ảnh không tìm thấy",
    });
  }
}
