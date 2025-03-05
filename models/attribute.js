'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Attribute.hasMany(models.ProductAttributeValue, {
        foreignKey: "attribute_id"
      })
    }
  }
  Attribute.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Attribute",
      tableName: "attributes",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Attribute;
};