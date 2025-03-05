'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductAttributeValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductAttributeValue.belongsTo(models.Product, {
        foreignKey: "product_id",
      });
      ProductAttributeValue.belongsTo(models.Attribute, {
        foreignKey: "attribute_id",
      });
    }
  }
  ProductAttributeValue.init(
    {
      product_id: DataTypes.INTEGER,
      attribute_id: DataTypes.INTEGER,
      value: DataTypes.TEXT, // giá trị của thuộc tính ví dụ intel17  16G, đỏ
    },
    {
      sequelize,
      modelName: "ProductAttributeValue",
      tableName: 'product_attribute_values',
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ProductAttributeValue;
};