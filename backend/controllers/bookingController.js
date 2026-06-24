import { Op } from 'sequelize';
import { Booking, Ticket, Zone, Event, sequelize } from '../models/index.js';

export const createBooking = async (req, res) => {
  const { 
    userId, eventId, zoneId, count, seats, totalPrice, fullName, email, phone 
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const zone = await Zone.findByPk(zoneId, { transaction: t });
    if (!zone || zone.availableTickets < count) {
      throw new Error('Số lượng vé còn lại không đủ');
    }

    const event = await Event.findByPk(eventId, { transaction: t });
    if (!event) throw new Error('Không tìm thấy sự kiện');

    const bookingId = `booking-${Date.now()}`;
    const repTicketId = `AP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = await Booking.create({
      id: bookingId,
      userId: userId || null,
      eventId,
      zoneId,
      count,
      seats: JSON.stringify(seats),
      totalPrice,
      fullName,
      email,
      phone,
      ticketId: repTicketId,
      paymentStatus: 'Pending',
      bookingType: 'primary'
    }, { transaction: t });

    const newTickets = [];
    for (let i = 0; i < count; i++) {
      const seat = seats && seats[i] ? seats[i] : null;
      const ticket = await Ticket.create({
        id: `ticket-${Date.now()}-${i}`,
        bookingId,
        userId: userId || 'user-1',
        eventId,
        zoneId,
        seatNumber: seat,
        qrCode: `QR-AP-${Math.floor(100000 + Math.random() * 900000)}-${i}`,
        status: 'inactive',
        purchaseType: 'primary'
      }, { transaction: t });
      newTickets.push(ticket);
    }

    await zone.update({
      availableTickets: zone.availableTickets - count
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ booking: newBooking, tickets: newTickets });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

export const getWalletTickets = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Thiếu userId' });
  try {
    const tickets = await Ticket.findAll({
      where: { userId, status: ['active', 'reselling'] },
      include: [
        { model: Event, as: 'event' },
        { model: Zone, as: 'zone' }
      ]
    });
    const formattedTickets = tickets.map(t => {
      const ticketData = t.toJSON();
      return {
        id: ticketData.id,
        bookingId: ticketData.bookingId,
        userId: ticketData.userId,
        eventId: ticketData.eventId,
        zoneId: ticketData.zoneId,
        seatNumber: ticketData.seatNumber,
        qrCode: ticketData.qrCode,
        status: ticketData.status,
        purchaseType: ticketData.purchaseType,
        createdAt: ticketData.createdAt,
        eventTitle: ticketData.event ? ticketData.event.title : '',
        image: ticketData.event ? ticketData.event.image : '',
        zoneName: ticketData.zone ? ticketData.zone.name : '',
        price: ticketData.zone ? ticketData.zone.price : 0
      };
    });
    res.json(formattedTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    const list = await Booking.findAll({
      include: [
        { model: Event, as: 'event' },
        { model: Zone, as: 'zone' }
      ],
      order: [['createdAt', 'DESC']]
    });
    const formatted = list.map(b => {
      const data = b.toJSON();
      return {
        id: data.id,
        eventId: data.eventId,
        eventTitle: data.event ? data.event.title : '',
        zoneName: data.zone ? data.zone.name : '',
        count: data.count,
        seats: JSON.parse(data.seats || '[]'),
        totalPrice: data.totalPrice,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        ticketId: data.ticketId,
        paymentStatus: data.paymentStatus,
        createdAt: data.createdAt
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBookingPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    const newStatus = booking.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    booking.paymentStatus = newStatus;
    await booking.save({ transaction: t });

    const ticketStatus = newStatus === 'Paid' ? 'active' : 'inactive';
    await Ticket.update(
      { status: ticketStatus },
      { where: { bookingId: booking.id }, transaction: t }
    );

    await t.commit();
    res.json(booking);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    if (booking.paymentStatus !== 'Paid') {
      await Zone.increment('availableTickets', {
        by: booking.count,
        where: { id: booking.zoneId },
        transaction: t
      });
    }
    await Ticket.destroy({ where: { bookingId: booking.id }, transaction: t });
    await booking.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const cancelExpiredBookings = async (expiryMinutes = 30) => {
  const cutoff = new Date(Date.now() - expiryMinutes * 60 * 1000);
  const expired = await Booking.findAll({
    where: { paymentStatus: 'Pending', createdAt: { [Op.lt]: cutoff } }
  });
  if (expired.length === 0) return { cancelled: 0 };
  let cancelled = 0;
  for (const booking of expired) {
    const t = await sequelize.transaction();
    try {
      await Zone.increment('availableTickets', {
        by: booking.count,
        where: { id: booking.zoneId },
        transaction: t
      });
      await Ticket.destroy({ where: { bookingId: booking.id }, transaction: t });
      await booking.destroy({ transaction: t });
      await t.commit();
      cancelled++;
    } catch (error) {
      try { await t.rollback(); } catch (_) {}
      console.error(`[expire] booking ${booking.id} failed:`, error.message);
    }
  }
  return { cancelled };
};

export const getTakenSeats = async (req, res) => {
  const { zoneId } = req.query;
  if (!zoneId) return res.status(400).json({ error: 'Thiếu zoneId' });
  try {
    const tickets = await Ticket.findAll({
      where: { 
        zoneId,
        status: ['active', 'reselling']
      },
      attributes: ['seatNumber']
    });
    const takenSeats = tickets
      .map(t => t.seatNumber)
      .filter(seat => seat !== null);
    res.json(takenSeats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
