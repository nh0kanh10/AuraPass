import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Creator = sequelize.define('Creator', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(100)
  },
  filterType: {
    type: DataTypes.STRING(50)
  },
  logo: {
    type: DataTypes.STRING(1000)
  },
  icon: {
    type: DataTypes.STRING(50)
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1)
  },
  followers: {
    type: DataTypes.STRING(50)
  },
  eventCount: {
    type: DataTypes.STRING(50)
  },
  location: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  accentColor: {
    type: DataTypes.STRING(50)
  },
  stats: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'Creators',
  timestamps: false
});

export default Creator;
