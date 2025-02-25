import { Sequelize, Op, where } from "sequelize";
import db from "../models";


export async function getProducts(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 10; // Number of items per page
  const offset = (page - 1) * pageSize;
  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { specification: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const [products, totalProducts] = await Promise.all([
    db.Product.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Product.count({
      where: whereClause,
    }),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách sản phẩm thành công",
    data: products,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
  });
}

export async function getProductById(req, res) {
  const { id } = req.params;
  const product = await db.Product.findByPk(id, {
      include:[{ model: db.ProductImage, as: "product_images"}],
  });
  console.log(product);
  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin sản phẩm thành công",
    data: product,
  });
}

export async function insertProducts(req, res) {
  // Kiểm tra xem sản phẩm đã tồn tại chưa
  const existingName = await db.Product.findOne({
    where: { name: req.body.name },
  });
  if (existingName) {
    return res.status(400).json({
      message: "Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!",
    });
  }
  const product = await db.Product.create(req.body);
  res.status(200).json({
    message: "Thêm mới sản phẩm thành công",
    data: product,
  });
}

export async function deleteProducts(req, res) {
  const { id } = req.params;
  const deleted = await db.Product.destroy({
    where: { id },
  });
  if (deleted) {
    res.status(200).json({
      message: "xoá sản phẩm thành công",
    });
  } else {
    res.status(200).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
}

export async function updateProducts(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (name !== undefined) {
    const existingProduct = await db.Product.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });
    if (existingProduct) {
      return res.status(409).json({
        message: "Tên sản phẩm đã tồn tại vui lòng chọn tên sản phẩm khác",
      });
    }
  }
  const updatedProduct = await db.Product.update(req.body, {
    where: { id },
  });
  if (updatedProduct) {
    return res.status(200).json({
      message: "update sản phẩm thành công",
    });
  }
  {
    return res.status(200).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
}
