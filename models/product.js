"use strict";
import {
  Model,
} from'sequelize';
export default  (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Brand, {
        foreignKey: "brand_id",
      });
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
      });
      Product.hasMany(models.CartItem, {
        foreignKey: "product_id",
      });
      Product.hasMany(models.BannerDetail, {
        foreignKey: "product_id",
      });
      Product.hasMany(models.OrderDetail, {
        foreignKey: "product_id",
      });
      Product.hasMany(models.Feedback, {
        foreignKey: "user_id",
      });
      Product.hasMany(models.ProductImage, {
        foreignKey: "product_id",
        as: "product_images",
      });
      Product.hasMany(models.ProductAttributeValue, {
        foreignKey: "product_id",
        as: "attributes",
      });
    }
  }
  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      price: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
        },
      },
      oldprice: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
        },
      },
      // image lưu ảnh đại diện
      image: DataTypes.TEXT,
      description: DataTypes.TEXT,
      specification: DataTypes.TEXT,
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // Mặc định số lượng tồn kho là 0
        comment: "Số lượng tồn kho",
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        comment: "Đánh giá sản phẩm (0-5)",
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Tổng số lượt đánh giá",
      },
      total_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Tổng số lượng đã bán",
      },
      brand_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Product;
};
