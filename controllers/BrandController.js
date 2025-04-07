import { getAvatarUrl } from "../helpers/imageHelper";
import db from "../models/index.js";
import { Op } from "sequelize";

export async function getBrands(req, res) {
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

  const [brands, totalBrands] = await Promise.all([
    db.Brand.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Brand.count({
      where: whereClause,
    }),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách thương hiệu thành công",
    data: brands.map(brand => ({
          ...brand.get({ plain: true }),
          image: getAvatarUrl(brand.image)
    })),
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBrands / pageSize),
    totalBrands,
  });
}

export async function getBrandById(req, res) {
  const { id } = req.params;
  const brand = await db.Brand.findByPk(id);
  if (!brand) {
    return res.status(404).json({
      message: "Thương hiệu không tìm thấy",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin thương hiệu thành công",
    data: {
      ...brand.get({ plain: true }),
      image: getAvatarUrl(brand.image),
    },
  });
}

export async function insertBrand(req, res) {
   const brand = await db.Brand.create(req.body);
   res.status(200).json({
     message: "Thêm mới thương hiệu thành công",
     data: {
       ...brand.get({ plain: true }),
       image: getAvatarUrl(brand.image),
     },
   });
}

export async function deleteBrand(req, res) {
  const { id } = req.params;
  const deleted = await db.Brand.destroy({
    where: { id },
  });
  if (deleted) {
    res.status(200).json({
      message: "xoá thương hiệu thành công",
    });
  } else {
    res.status(200).json({
      message: "Thương hiệu không tìm thấy",
    });
  }
}

export async function updateBrand(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (name !== undefined) {
    const existingBrand = await db.Brand.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        message:
          "Tên thương hiệu đã tồn tại vui lòng chọn tên thương hiệu khác",
      });
    }
  }
  const updatedBrand = await db.Brand.update(req.body, {
    where: { id },
  });
  if (updatedBrand) {
    return res.status(200).json({
      message: "update thương hiệu thành công",
    });
  } else {
    return res.status(200).json({
      message: "Thương hiệu không tìm thấy",
    });
  }
}
