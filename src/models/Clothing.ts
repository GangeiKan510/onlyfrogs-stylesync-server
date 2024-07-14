import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/index';
class Clothing extends Model {
  public id!: number;
  public name!: string;
  public color!: string;
  public type!: string;
  public imageUrl!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Clothing.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'clothing',
  }
);

export default Clothing;
