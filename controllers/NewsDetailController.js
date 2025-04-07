import { Op, where } from "sequelize";
import db from "../models/index.js";

export async function getNewsDetails(req, res) {
  const { page = 1 } = req.query;
  const pageSize = 10; // Number of items per page
  const offset = (page - 1) * pageSize;

  const [newsDetails, totalNewsDetails] = await Promise.all([
    db.NewsDetail.findAll({
      limit: pageSize,
      offset: offset,
      include: [{ model: db.News }, { model: db.Product }],
    }),
    db.Category.count(),
  ]);
  return res.status(200).json({
    message: "Lấy danh sách tin tức chi tiêt thành công",
    data: newsDetails,
    current_page: parseInt(page, 10),
    total_pages: Math.ceil(totalNewsDetails / pageSize),
    total:totalNewsDetails,
  });
}

export async function getNewsDetailsById(req, res) {
  const { id } = req.params;
  const newsDetail = await db.NewsDetail.findByPk(id, {
    include: [{ model: db.News }, { model: db.Product }],
  });

  if (!newsDetail) {
    return res.status(404).json({
      message: "Chi tiết tin tức không tìm thấy",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin chi tiết tin tức",
    data: newsDetail,
  });
}

export async function insertNewsDetail(req, res) {
  const { product_id, news_id } = req.body;

  const productExits = await db.Product.findByPk(product_id);
  if (!productExits) {
    res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  const newsExits = await db.News.findByPk(news_id);
  if (!newsExits) {
    res.status(404).json({
      message: "Tin tức không tồn tại",
    });
    }
    const duplicateExists = await db.NewsDetail.findOne({
        where: { product_id, news_id }
    });
    if (duplicateExists) {
        return es.status(409).json({
          message: "Mối quan hệ giữa sản phẩm và tin tức đã tồn tại",
        });
    }
  const newsDetail = db.NewsDetail.create({ product_id, news_id });

  return res.status(200).json({
    message: "Thêm mới chi tiết tin tức thành công",
    data: newsDetail,
  });
}

export async function deleteNewsDetail(req, res) {
  const { id } = req.params;
  const deleted = db.NewsDetail.destroy({ where: { id } });

  if (deleted) {
    res.status(200).json({
      message: "Xoá chi tiết tin tức thành công",
    });
  } else {
    res.status(404).json({
      message: "Chi tiết tin tức không tìm thấy",
    });
  }
}

export async function updateNewsDetail(req, res) {
  const { id } = req.params;
  const { product_id, news_id } = req.body;

  const existingDuplicate = await db.NewsDetail.findOne({
    where: {
      product_id, news_id,
      id: {[Op.ne]: id}
    }
  })
  if (existingDuplicate) {
    return res.status(409).json({
          message: "Mối quan hệ giữa sản phẩm và tin tức đã tồn tại trong bản ghi khác",
        });
  }
  const updateNewsDetail = db.NewsDetail.update(
    { product_id, news_id },
    { where: { id } }
  );

  if (updateNewsDetail[0] > 0) {
    res.status(200).json({
      message: "Cập nhật chi tiết tin tức thành công",
    });
  } else {
    res.status(404).json({
      message: "Chi tiết tin tức không tìm thấy",
    });
  }
}
