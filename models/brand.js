'use strict';
import { Model } from"sequelize";
export default  (sequelize, DataTypes) => {
  class Brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Brand.hasMany(models.Product, {
        foreignKey: "brand_id",
      });
    }
  }
  Brand.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Brand",
      tableName: "brands",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Brand;
};