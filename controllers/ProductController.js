import { Sequelize, Op, where } from "sequelize";
import db from "../models";
import { getAvatarUrl } from "../helpers/imageHelper";


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

  // Khởi tạo whereClause cho thuộc tính động
  let attributeWhereClause = {};
  if (search.trim() !== "") {
    attributeWhereClause = { value: { [Op.like]: `%${search}%` } }
  }
console.log(attributeWhereClause)
  const [products, totalProducts] = await Promise.all([
    db.Product.findAll({
      where: whereClause,
      include: [
        {
          model: db.ProductAttributeValue,
          as: "attributes",
          include: [{ model: db.Attribute }],
          where: attributeWhereClause,
          required: false
        },
      ],
      limit: pageSize,
      offset: offset,
    }),
    db.Product.count({
      where: whereClause,
    }),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách sản phẩm thành công",
    data: products.map((product) => ({
      ...product.get({ plain: true }),
      image: getAvatarUrl(product.image),
    })),
    current_page: parseInt(page, 10),
    total_pages: Math.ceil(totalProducts / pageSize),
    total:totalProducts,
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
        include: [
          {model: db.Attribute, attributes: ["name"]}
        ]
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
      attributes
    },
  });
}

export async function deleteProducts(req, res) {
  const { id } = req.params;

  // kiểm tra sản phẩm có trong orderDetail ko
  const orderDetailExists = await db.OrderDetail.findOne({
    where: { product_id },
    include: [{
      model: db.Order,
      as: "order",
      attributes: ["id", "status", "note", 'total', 'created_at']
    }]
  })

  if (orderDetailExists) {
    return res.status(400).json({
      message: "Không thể xoá sản phẩm vì đã có đơn hàng tham chiếu đến sản phẩm này",
      data: {
        order: orderDetailExists.order
      }
    });
  }

  await db.ProductAttributeValue.destroy({
    where: {id}
  })
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
        await productAttributeValue.update({value: attr.value})
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
