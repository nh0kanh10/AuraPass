import sequelize from '../config/database.js';
import User from './User.js';
import Creator from './Creator.js';
import Event from './Event.js';
import Zone from './Zone.js';
import Booking from './Booking.js';
import Ticket from './Ticket.js';
import ResaleTicket from './ResaleTicket.js';

Creator.hasMany(Event, { foreignKey: 'creatorId', as: 'events' });
Event.belongsTo(Creator, { foreignKey: 'creatorId', as: 'creator' });

Event.hasMany(Zone, { foreignKey: 'eventId', as: 'zones' });
Zone.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Booking.belongsTo(Zone, { foreignKey: 'zoneId', as: 'zone' });

Ticket.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Ticket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Ticket.belongsTo(Zone, { foreignKey: 'zoneId', as: 'zone' });

ResaleTicket.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });
ResaleTicket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
ResaleTicket.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

export {
  sequelize,
  User,
  Creator,
  Event,
  Zone,
  Booking,
  Ticket,
  ResaleTicket
};
