import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ResaleTicket = sequelize.define('ResaleTicket', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  ticketId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  eventId: {
    type: DataTypes.STRING(50)
  },
  eventTitle: {
    type: DataTypes.STRING(255)
  },
  zoneName: {
    type: DataTypes.STRING(100)
  },
  seatInfo: {
    type: DataTypes.STRING(100)
  },
  originalPrice: {
    type: DataTypes.DECIMAL(18, 2)
  },
  resalePrice: {
    type: DataTypes.DECIMAL(18, 2)
  },
  sellerId: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'available'
  },
  createdAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'ResaleTickets',
  timestamps: false
});

export default ResaleTicket;
