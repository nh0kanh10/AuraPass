import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.STRING(50)
  },
  userId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  eventId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  zoneId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  seatNumber: {
    type: DataTypes.STRING(50)
  },
  qrCode: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active'
  },
  purchaseType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'primary'
  },
  createdAt: {
    type: DataTypes.DATE
  },
  updatedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'Tickets',
  timestamps: false
});

export default Ticket;
