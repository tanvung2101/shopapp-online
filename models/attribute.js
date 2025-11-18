'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define('Attribute', {
    name: DataTypes.STRING
  }, {
    tableName: 'attributes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Attribute.associate = function(models) {
    Attribute.hasMany(models.ProductAttributeValue, { foreignKey: 'attribute_id' });
  };

  return Attribute;
};
