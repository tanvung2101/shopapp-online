import { Op, where } from "sequelize";
import db from "../models";
import path from "path";
import fs from "fs";

export async function getBannerDetails(req, res) {
  const bannerDetails = await db.BannerDetail.findAll();
  return res.status(200).json({
    message: "Lấy danh sách tin tức chi tiêt banner thành công",
    data: bannerDetails,
  });
}

export async function getBannerDetailById(req, res) {
  const { id } = req.params;
  const bannerDetail = await db.BannerDetail.findByPk(id);
  if (!bannerDetail) {
    return res.status(404).json({
      message: "Chi tiết banner không tìm thấy",
    });
  }
  return res.status(200).json({
    message: "Lấy chi tiêt banner thành công",
    data: bannerDetail,
  });
}

export async function insertBannerDetail(req, res) {
  const { product_id, banner_id } = req.body;

  const productExits = await db.Product.findByPk(product_id);
  if (!productExits) {
    res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  const bannerExits = await db.Banner.findByPk(banner_id);
  if (!bannerExits) {
    res.status(404).json({
      message: "Banner không tồn tại",
    });
    }
    const duplicateExists = await db.BannerDetail.findOne({
      where: { product_id, banner_id },
    });
    if (duplicateExists) {
        return res.status(409).json({
          message: "Mối quan hệ giữa sản phẩm và banner đã tồn tại",
        });
  }
  const bannerDetail = db.BannerDetail.create({ product_id, banner_id });
  return res.status(200).json({
    message: "Thêm mới chi tiết banner thành công",
    data: bannerDetail,
  });
}

export async function deleteBannerDetail(req, res) {
  const { id } = req.params;
  const deleted = db.BannerDetail.destroy({ where: { id } });

  if (deleted) {
    res.status(200).json({
      message: "Xoá chi tiết banner thành công",
    });
  } else {
    res.status(404).json({
      message: "Chi tiết banner không tìm thấy",
    });
  }
}

export async function updateBannerDetail(req, res) {
  const { id } = req.params;
  const { product_id, banner_id } = req.body;

  const existingBannerDetail = await db.BannerDetail.findOne({
    where: {
      product_id,
      banner_id,
      id: { [Op.ne]: id }
    }
  })

  if (existingBannerDetail) {
    return res.status(409).json({
      message:
        "Đã tồn tại một chi tiết banner với sản phẩm và banner này",
    });
  }

    const updated = await db.BannerDetail.update({
        product_id,banner_id
    },{
    where: {
      id
    },
  });
    return res.status(200).json({
      message:
        "Cập nhật chi tiết banner thành công",
    });
}