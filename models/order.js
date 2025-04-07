'use strict';
import {
  Model,
} from'sequelize';
export default  (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, {
        foreignKey: "user_id",
      }),
      Order.belongsTo(models.OrderDetail, {
        foreignKey: "order_id",
        as: "order_details"
      });
    }
  }
  Order.init(
    {
      user_id: DataTypes.INTEGER,
      status: {
        type: DataTypes.INTEGER,
        comment:
          "1: Pending, 2: Processing, 3: Shipped, 4: Delivered, 5: Cancelled, 6: Refunded, 7:Failed",
      },
      note: DataTypes.TEXT,
      phone: DataTypes.TEXT,
      address: DataTypes.TEXT,
      total: DataTypes.INTEGER,
      session_id: {
        type: DataTypes.STRING,
        // unique: true
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Order;
};
