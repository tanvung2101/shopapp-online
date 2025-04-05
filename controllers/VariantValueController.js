// VariantValueController.js
import db from "../models";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import { getAvatarUrl } from "../helpers/imageHelper";

export const getVariantValues = async (req, res) => {
  const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
  const pageSize = isNaN(parseInt(req.query.page_size)) ? 20 : parseInt(req.query.page_size);
  const search = req.query.search || ''; // Biến tìm kiếm
  const variant_id = req.query.variant_id; // Lọc theo variant_id nếu cần
  const offset = (page - 1) * pageSize;

  // Xây dựng điều kiện lọc
  let whereClause = {};
  if (search.trim() !== '') {
    whereClause.value = { [Op.like]: `%${search}%` };
  }
  if (variant_id) {
    whereClause.variant_id = variant_id;
  }

  const [variantValues, totalVariantValues] = await Promise.all([
    db.VariantValue.findAll({
      where: whereClause,
      include: [
        {
          model: db.Variant,
          as: 'variant',
          attributes: ['id', 'name'], // Chỉ lấy các trường cần thiết từ Variant
        },
      ],
      limit: pageSize,
      offset: offset,
    }),
    db.VariantValue.count({
      where: whereClause,
    }),
  ]);

  res.status(200).json({
    message: "Lấy danh sách giá trị biến thể thành công",
    data: variantValues.map((variantValue) => ({
      ...variantValue.get({ plain: true }), // Chuyển đổi Sequelize instance thành plain object
      image: getAvatarUrl(variantValue.image), // Áp dụng hàm getAvatarURL
    })),
    current_page: parseInt(page, 10),
    total_page: Math.ceil(totalVariantValues / pageSize),
    total: totalVariantValues,
  });
};

export async function getVariantValueById(req, res) {
  const { id } = req.params;
  const variantValue = await db.VariantValue.findByPk(id, {
    include: [
      {
        model: db.Variant,
        as: 'variant',
        attributes: ['id', 'name'], // Chỉ lấy các trường cần thiết từ Variant
      },
    ],
  });

  if (!variantValue) {
    return res.status(404).json({
      message: 'Giá trị biến thể không tìm thấy',
    });
  }

  res.status(200).json({
    message: "Lấy thông tin giá trị biến thể thành công",
    data: {
      ...variantValue.get({ plain: true }),
      image: getAvatarUrl(variantValue.image),
    },
  });
}

export async function insertVariantValue(req, res) {
  const { variant_id, value, image } = req.body;

  // Kiểm tra xem variant_id có tồn tại không
  const variantExists = await db.Variant.findByPk(variant_id);
  if (!variantExists) {
    return res.status(400).json({
      message: `Variant ID ${variant_id} không tồn tại`,
    });
  }

  // Thêm giá trị biến thể mới
  const variantValue = await db.VariantValue.create({ variant_id, value, image });

  res.status(201).json({
    message: "Thêm mới giá trị biến thể thành công",
    data: {
      ...variantValue.get({ plain: true }),
      image: getAvatarUrl(variantValue.image),
    },
  });
}

export async function updateVariantValue(req, res) {
  const { id } = req.params;
  const { value, image } = req.body;

  // Cập nhật giá trị biến thể
  const updated = await db.VariantValue.update({ value, image }, {
    where: { id },
  });

  if (updated[0] > 0) {
    return res.status(200).json({
      message: 'Cập nhật giá trị biến thể thành công',
    });
  } else {
    return res.status(404).json({
      message: 'Giá trị biến thể không tìm thấy',
    });
  }
}

export async function deleteVariantValue(req, res) {
  const { id } = req.params;
  const deleted = await db.VariantValue.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: 'Xóa giá trị biến thể thành công',
    });
  } else {
    return res.status(404).json({
      message: 'Giá trị biến thể không tìm thấy',
    });
  }
}
