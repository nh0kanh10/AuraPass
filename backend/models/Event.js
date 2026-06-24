import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  date: {
    type: DataTypes.STRING(100)
  },
  time: {
    type: DataTypes.STRING(50)
  },
  location: {
    type: DataTypes.STRING(550)
  },
  priceRange: {
    type: DataTypes.STRING(100)
  },
  image: {
    type: DataTypes.STRING(1000)
  },
  badge: {
    type: DataTypes.STRING(50)
  },
  theme: {
    type: DataTypes.STRING(50)
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  creatorId: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'approved'
  },
  organizerId: {
    type: DataTypes.STRING(50)
  },
  eventType: {
    type: DataTypes.STRING(50),
    defaultValue: 'live'
  },
  onlineLink: {
    type: DataTypes.STRING(1000)
  },
  platform: {
    type: DataTypes.STRING(100)
  },
  onlinePassword: {
    type: DataTypes.STRING(255)
  },
  onlineInstructions: {
    type: DataTypes.STRING(2000)
  }
}, {
  tableName: 'Events',
  timestamps: false
});

export default Event;
