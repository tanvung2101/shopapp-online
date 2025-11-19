// models/attribute.js
export default (sequelize, DataTypes) => {
  const Attribute = sequelize.define(
    "Attribute",
    {
      name: DataTypes.STRING,
    },
    {
      tableName: "attributes",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Attribute.associate = (models) => {
    Attribute.hasMany(models.ProductAttributeValue, { foreignKey: "attribute_id" });
  };

  return Attribute;
};
