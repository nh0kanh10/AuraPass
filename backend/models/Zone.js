import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Zone = sequelize.define('Zone', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  eventId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  isStanding: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  availableTickets: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rows: {
    type: DataTypes.INTEGER
  },
  cols: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'Zones',
  timestamps: false
});

export default Zone;
