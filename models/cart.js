'use strict';
import { Model } from"sequelize";
export default  (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart.hasMany(models.CartItem, {
        foreignKey: "cart_id",
        as: "cart_items",
      });
    }
  }
  Cart.init(
    {
      session_id: {
        type: DataTypes.STRING,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "carts",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Cart;
};