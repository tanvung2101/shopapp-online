import { Op, where } from "sequelize";
import db from "../models";
import { BannerStatus } from "../constants";
import { getAvatarUrl } from "../helpers/imageHelper";

export async function getBanners(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  let whereClause = {};

  if (search.trim() !== "") {
    whereClause = {
      name: { [Op.like]: `%${search}%` },
    };
  }

  const [banners, totalBanners] = await Promise.all([
    db.Banner.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Banner.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách banner thành công",
    data: banners.map(banner => ({
      ...banner.get({ plain: true }),
      image: getAvatarUrl(banner.image)
    })),
    current_page: parseInt(page, 10),
    total_pages: Math.ceil(totalBanners / pageSize),
    total:totalBanners,
  });
}

export async function getBannerById(req, res) {
  const { id } = req.params;
  const banner = await db.Banner.findByPk(id);
  if (!banner) {
    return res.status(404).json({ message: "Banner không tìm thấy" });
  }
  res.status(200).json({
    message: "Lấy thông tin banner",
    data: {
      ...banner.get({ plain: true }),
      image: getAvatarUrl(banner.image),
    },
  });
}

export async function insertBanner(req, res) {
  const { name } = req.body;
  const existingBanner = await db.Banner.findOne({ where: { name: name.trim() } });
  console.log(existingBanner)
  if (existingBanner) {
    return res.status(409).json({
      message: "Tên banner đã tồn tại vui lòng chọn tên khác",
    });
  }

  const bannerData = {
    ...req.body,
    status: BannerStatus.ACTIVE
  }

  const banner = await db.Banner.create(bannerData);
  return res.status(201).json({
    message: "Thêm mới banner thành công",
    data: banner,
  });
}

export async function deleteBanner(req, res) {
  const { id } = req.params;
  try {
    const deleted = await db.Banner.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Banner không tìm thấy" });
    }
    res.status(200).json({ message: "Xoá banner thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xoá banner", error: error.message });
  }
}

export async function updateBanner(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (name !== undefined) {
    const existingBanner = await db.Banner.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });
    if (existingBanner) {
      return res.status(409).json({
        message: "Tên banner đã tồn tại vui lòng chọn tên banner khác",
      });
    }
  }
  const updatedBanner = await db.Banner.update(req.body, { where: { id } });

  if (updatedBanner) {
    return res.status(200).json({ message: "Cập nhật banner thành công" });
  } else {
    return res.status(404).json({ message: "Banner không tìm thấy" });
  }
}
