'use strict';
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Order, {
        foreignKey: "user_id",
      }),
        User.hasMany(models.Feedback, {
          foreignKey: "user_id",
        });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      role: DataTypes.INTEGER,
      avatar: DataTypes.STRING,
      phone: DataTypes.INTEGER,
      is_locked: DataTypes.INTEGER,
      password_changed_at: DataTypes.DATE,
      reset_token_created_at: DataTypes.DATE,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      freezeTableName: true
    }

  );
  return User;
};