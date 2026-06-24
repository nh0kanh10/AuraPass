import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING(50)
  },
  eventId: {
    type: DataTypes.STRING(50)
  },
  zoneId: {
    type: DataTypes.STRING(50)
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seats: {
    type: DataTypes.TEXT
  },
  totalPrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ticketId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pending'
  },
  bookingType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'primary'
  },
  createdAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'Bookings',
  timestamps: false
});

export default Booking;
