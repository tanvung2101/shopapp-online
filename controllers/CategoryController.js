import { Op } from "sequelize";
import db from "../models/index.js";
import { getAvatarUrl } from "../helpers/imageHelper.js";

export async function getCategories(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 10; // Number of items per page
  const offset = (page - 1) * pageSize;
  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        // {description: { [Op.like] : `%${search}%`}},
      ],
    };
  }

  const [categories, totalCategories] = await Promise.all([
    db.Category.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Category.count({
      where: whereClause,
    }),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách danh mục thành công",
    data: categories.map((category) => ({
      ...category.get({ plain: true }),
      image: getAvatarUrl(category.image),
    })),
    current_age: parseInt(page, 10),
    total_pages: Math.ceil(totalCategories / pageSize),
    total:totalCategories,
  });
}

export async function getCategoryById(req, res) {
  const { id } = req.params;
  const category = await db.Category.findByPk(id);
  if (!category) {
    return res.status(404).json({
      message: "Danh mục không tìm thấy",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin danh mục",
    data: {
      ...category.get({ plain: true }),
      image: getAvatarUrl(category.image),
    },
  });
}

export async function insertCategory(req, res) {
  const category = await db.Category.create(req.body);
  res.status(201).json({
    message: "Thêm mới danh mục thành công",
    data: {
      ...category.get({ plain: true }),
      image: getAvatarUrl(category.image),
    },
  });
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  const deleted = await db.Category.destroy({
    where: { id },
  });
  if (deleted) {
    res.status(200).json({
      message: "xoá danh mục thành công",
    });
  } else {
    res.status(200).json({
      message: "Danh mục không tìm thấy",
    });
  }
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (name !== undefined) {
    const existingCategory = await db.Category.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Tên category đã tồn tại vui lòng chọn tên category khác",
      });
    }
  }
  const updatedCategory = await db.Category.update(req.body, {
    where: { id },
  });
  if (updatedCategory) {
    return res.status(200).json({
      message: "update danh mục thành công",
    });
  }
  {
    return res.status(200).json({
      message: "Danh mục không tìm thấy",
    });
  }
}
