import { Op, where } from "sequelize";
import db from "../models";

export async function getNews(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const [news, totalNews] = await Promise.all([
    db.News.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.News.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách tin tức thành công",
    data: news.map((item) => ({
      ...item.get({ plain: true }),
      image: getAvatarUrl(item.image),
    })),
    current_page: parseInt(page, 10),
    total_pages: Math.ceil(totalNews / pageSize),
    total:totalNews,
  });
}

export async function getNewsArticleById(req, res) {
  const { id } = req.params;
  const news = await db.News.findByPk(id);
  if (!news) {
    return res.status(404).json({
      message: "Tin tức không tìm thấy",
    });
  }
  res.status(200).json({
    message: "Lấy thông tin tin tức",
    data: {
      ...news.get({ plain: true }),
      image: getAvatarUrl(news.image),
    },
  });
}

export async function insertNewsArticle(req, res) {
  const transaction = await db.sequelize.transaction();

  try {
    const newsArticle = await db.News.create(req.body, { transaction });
    // console.log(newsArticle)
    const productIds = req.body.product_ids;
    // console.log(productIds)
    if (productIds && productIds.length > 0) {
      const validProducts = await db.Product.findAll({
        where: { id: productIds },
        transaction,
      });
      const validProductIds = validProducts.map((product) => product.id);

      const filteredProductIds = productIds.filter((id) =>
        validProductIds.includes(id)
      );
      const newDetailPromises = filteredProductIds.map((product_id) =>
        db.NewsDetail.create(
          {
            product_id,
            news_id: newsArticle.id,
          },
          { transaction }
        )
      );
      console.log(newDetailPromises);
      await Promise.all(newDetailPromises);
    }

    await transaction.commit();

    res.status(201).json({
      message: "Thêm mới bài báo thành công",
      data: {
        ...newsArticle.get({ plain: true }),
        image: getAvatarUrl(newsArticle.image),
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({
      message: "Không thể thêm bài báo mới",
      error: error,
    });
  }
}

export async function deleteNewsArticle(req, res) {
  const { id } = req.params;
  const transaction = await db.sequelize.transaction(); // Khởi tạo transaction
  try {
    // Xoá các bản ghi liên quan trong bảng NewsDetail
    await db.NewsDetail.destroy({
      where: { news_id: id },
      transaction,
    });

    // Xoá bài viết chính trong bảng News
    const deleted = await db.News.destroy({
      where: { id },
      transaction,
    });

    if (!deleted) {
      await transaction.rollback(); // Hoàn tác nếu không tìm thấy bài viết
      return res.status(404).json({ message: "Tin tức không tìm thấy" });
    }

    await transaction.commit(); // Xác nhận transaction nếu mọi thứ thành công
    res.status(200).json({ message: "Xoá tin tức thành công" });
  } catch (error) {
    await transaction.rollback(); // Hoàn tác nếu có lỗi
    res
      .status(500)
      .json({ message: "Lỗi khi xoá tin tức", error: error.message });
  }
}

export async function updateNewsArticle(req, res) {
  const { id } = req.params;
  const { title } = req.body;
  const existingNews = await db.News.findOne({
    where: {
      title,
      id: { [Op.ne]: id },
    },
  });

  if (existingNews) {
    return res.status(409).json({
      message: "Tên tin tức đã tồn tại vui lòng chọn tên tin tức khác",
    });
  }
  const updated = await db.News.update(req.body, {
    where: { id },
  });
  // update new details
  if (updated) {
    res.status(200).json({
      message: "Cập nhật tin tức thành công",
    });
  } else {
    res.status(404).json({
      message: "Tin tức không tìm thấy",
    });
  }
}
