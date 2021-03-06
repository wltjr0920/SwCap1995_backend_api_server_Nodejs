'use strict';
module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('category', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    like_num: {
      type: DataTypes.INTEGER
    },
    image_url: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  category.associate = function(models) {
    category.hasMany(models.detailedCategory, {foreignKey: 'topCategoryNum'});
  };
  return category;
};