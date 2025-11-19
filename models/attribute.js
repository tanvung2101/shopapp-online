// models/attribute.js
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Attribute extends Model {
    static associate(models) {
      Attribute.hasMany(models.ProductAttributeValue, {
        foreignKey: "attribute_id",
      });
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
