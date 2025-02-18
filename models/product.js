'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
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
      Product.hasMany(models.BannerDetail, {
        foreignKey: "product_id",
      });
      Product.hasMany(models.OrderDetail, {
        foreignKey: "product_id",
      });
      Product.hasMany(models.Feedback, {
        foreignKey: "user_id",
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
      image: DataTypes.TEXT,
      description: DataTypes.TEXT,
      specification: DataTypes.TEXT,
      buyturn: DataTypes.INTEGER,
      quantity: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
        },
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
    }
  );
  return Product;
};