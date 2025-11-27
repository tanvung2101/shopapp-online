// models/product.js
export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      price: {
        type: DataTypes.INTEGER,
        validate: { min: 0 },
      },
      oldprice: {
        type: DataTypes.INTEGER,
        validate: { min: 0 },
      },
      image: DataTypes.TEXT,
      description: DataTypes.TEXT,
      specification: DataTypes.TEXT,
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      brand_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
    },
    {
      tableName: "products",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brand_id" });
    Product.belongsTo(models.Category, { foreignKey: "category_id" });
    Product.hasMany(models.CartItem, { foreignKey: "product_id" });
    Product.hasMany(models.BannerDetail, { foreignKey: "product_id" });
    Product.hasMany(models.OrderDetail, { foreignKey: "product_id" });
    Product.hasMany(models.Feedback, { foreignKey: "user_id" });
    Product.hasMany(models.ProductImage, {
      foreignKey: "product_id",
      as: "product_images",
    });
    Product.hasMany(models.ProductAttributeValue, {
      foreignKey: "product_id",
      as: "attributes",
    });
  };

  return Product;
};
