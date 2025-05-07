import {  Op} from "sequelize";
import { getAvatarUrl } from "../helpers/imageHelper.js";
import db from "../models/index.js";



export async function getProducts(req, res) {

    const {
      page = 1,
      category,
      brand,
      sort_price,
      price_max,
      price_min,
      name = '',
     sort_by,
      rating_filter,
    } = req.query;

    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const whereClause = {};
    const orderClause = [];

    // 🔍 Tìm kiếm theo tên, mô tả, thông số kỹ thuật
    if (name.trim() !== "") {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${name}%` } },
        { description: { [Op.like]: `%${name}%` } },
        { specification: { [Op.like]: `%${name}%` } },
      ];
    }

    // 🔍 Lọc theo brand/category
    if (category) whereClause.category_id = category;
    if (brand) whereClause.brand_id = brand;

    // 🔍 Lọc theo khoảng giá
    if (price_min !== undefined || price_max !== undefined) {
      whereClause.price = {};
      if (price_min !== undefined) whereClause.price[Op.gte] = price_min;
      if (price_max !== undefined) whereClause.price[Op.lte] = price_max;
    }

    // 🔍 Lọc theo đánh giá
    if (rating_filter !== undefined) {
      whereClause.rating = { [Op.gte]: Number(rating_filter) };
    }

    // 🔃 Sắp xếp theo giá
    if (sort_price === "asc") {
      orderClause.push(["price", "ASC"]);
    } else if (sort_price === "desc") {
      orderClause.push(["price", "DESC"]);
    }


    if (["views", "created_at", "total_sold"].includes(sort_by)) {
      orderClause.push([sort_by, "DESC"]);
    }

    const [products, totalProducts] = await Promise.all([
      db.Product.findAll({
        where: whereClause,
        include: [
          { model: db.Category, as: "Category" },
          { model: db.Brand, as: "Brand" },
        ],
        limit: pageSize,
        offset: offset,
        order: orderClause,
      }),
      db.Product.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products.map((product) => ({
        ...product.get({ plain: true }),
        image: getAvatarUrl(product.image),
      })),
      current_page: parseInt(page, 10),
      total_pages: Math.ceil(totalProducts / pageSize),
      total: totalProducts,
    });
}


export async function getProductById(req, res) {
  const { id } = req.params;
  const product = await db.Product.findByPk(id, {
    include: [
      { model: db.ProductImage, as: "product_images" },
      {
        model: db.ProductAttributeValue,
        as: "attributes",
        include: [{ model: db.Attribute, attributes: ["name"] }],
      },
    ],
  });
  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin sản phẩm thành công",
    data: {
      ...product.get({ plain: true }),
      image: getAvatarUrl(product.image),
    },
  });
}

export async function insertProducts(req, res) {
  const { name, attributes = [], ...productData } = req.body;
  // Kiểm tra xem sản phẩm đã tồn tại chưa
  const ProductExist = await db.Product.findOne({
    where: { name },
  });
  if (ProductExist) {
    return res.status(400).json({
      message: "Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!",
    });
  }
  const product = await db.Product.create(req.body);

  if (attributes.length > 0) {
    for (const attr of attributes) {
      const [attribute] = await db.Attribute.findOrCreate({
        where: { name: attr.name },
      });
      await db.ProductAttributeValue.create({
        product_id: product.id,
        attribute_id: attribute.id,
        value: attr.value,
      });
    }
  }
  res.status(200).json({
    message: "Thêm mới sản phẩm thành công",
    data: {
      ...product.get({ plain: true }),
      image: getAvatarUrl(product.image),
      attributes,
    },
  });
}

export async function deleteProducts(req, res) {
  const { id } = req.params;

  // kiểm tra sản phẩm có trong orderDetail ko
  const orderDetailExists = await db.OrderDetail.findOne({
    where: { product_id },
    include: [
      {
        model: db.Order,
        as: "order",
        attributes: ["id", "status", "note", "total", "created_at"],
      },
    ],
  });

  if (orderDetailExists) {
    return res.status(400).json({
      message:
        "Không thể xoá sản phẩm vì đã có đơn hàng tham chiếu đến sản phẩm này",
      data: {
        order: orderDetailExists.order,
      },
    });
  }

  await db.ProductAttributeValue.destroy({
    where: { id },
  });
  const deleted = await db.Product.destroy({
    where: { id },
  });
  if (deleted) {
    return res.status(200).json({
      message: "xoá sản phẩm thành công",
    });
  } else {
    return res.status(400).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
}

export async function updateProducts(req, res) {
  const { id } = req.params;
  const { attributes = [], ...productData } = req.body;

  const updatedRowCount = await db.Product.update(productData, {
    where: { id },
  });

  if (updatedRowCount) {
    for (const attr of attributes) {
      const [attribute] = await db.Attribute.findOrCreate({
        where: { name: attr.name },
      });
      const productAttributeValue = await db.ProductAttributeValue.findOne({
        where: {
          product_id: id,
          attribute_id: attribute.id,
        },
      });

      if (productAttributeValue) {
        await productAttributeValue.update({ value: attr.value });
      } else {
        await db.ProductAttributeValue.create({
          product_id: id,
          attribute_id: attribute.id,
          value: attr.value,
        });
      }
    }

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
    });
  } else {
    return res.status(401).json({
      message: "Sản phẩm không tìm thấy",
    });
  }
}
