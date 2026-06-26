import { ResaleTicket, Ticket, Event, Zone, Booking, User, sequelize } from '../models/index.js';
import { isSalesClosed } from '../utils/dateHelper.js';
import { cleanupExpiredResales } from '../utils/resaleCleanup.js';

export const createResaleList = async (req, res) => {
  const { ticketId, resalePrice, sellerId } = req.body;
  const t = await sequelize.transaction();

  try {
    const ticket = await Ticket.findByPk(ticketId, { transaction: t });
    if (!ticket) throw new Error('Không tìm thấy vé trong ví');
    if (ticket.status !== 'active') throw new Error('Vé không ở trạng thái hoạt động');

    const event = await Event.findByPk(ticket.eventId, { transaction: t });
    if (event && isSalesClosed(event.date, event.time)) {
      throw new Error('Sự kiện đã ngưng bán vé, không thể ký gửi bán lại');
    }

    const zone = await Zone.findByPk(ticket.zoneId, { transaction: t });

    await ticket.update({ status: 'reselling' }, { transaction: t });

    const newResale = await ResaleTicket.create({
      id: `resale-${Date.now()}`,
      ticketId,
      eventId: ticket.eventId,
      eventTitle: event.title,
      zoneName: zone.name,
      seatInfo: ticket.seatNumber ? `Hàng ${ticket.seatNumber.split('-')[0] || 'A'} - Ghế ${ticket.seatNumber.split('-')[1] || ticket.seatNumber}` : 'Vé đứng (GA)',
      originalPrice: zone.price,
      resalePrice,
      sellerId,
      status: 'available'
    }, { transaction: t });

    await t.commit();
    res.status(201).json(newResale);
  } catch (error) {
    console.error("LỖI BAN ĐẦU KHI KÝ GỬI VÉ:", error);
    try {
      if (t && !t.finished) {
        await t.rollback();
      }
    } catch (rollbackError) {
      console.error("Lỗi khi rollback transaction:", rollbackError);
    }
    res.status(400).json({ error: error.message });
  }
};

export const getResaleList = async (req, res) => {
  try {
    // 1. Tự động dọn dẹp các vé resale quá hạn trước
    await cleanupExpiredResales();

    // 2. Lấy danh sách vé resale available
    const list = await ResaleTicket.findAll({
      where: { status: 'available' },
      include: [{ model: Event, as: 'event' }]
    });

    // 3. Lọc bỏ các vé resale có sự kiện đã ngưng bán (cách giờ bắt đầu < 1 tiếng)
    const activeResales = [];
    for (const item of list) {
      const event = item.event;
      if (event) {
        if (!isSalesClosed(event.date, event.time)) {
          activeResales.push(item);
        }
      } else {
        activeResales.push(item);
      }
    }

    res.json(activeResales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const buyResaleTicket = async (req, res) => {
  const { resaleId, buyerId, fullName, email, phone } = req.body;
  const t = await sequelize.transaction();

  try {
    const resaleItem = await ResaleTicket.findByPk(resaleId, { transaction: t });
    if (!resaleItem || resaleItem.status !== 'available') {
      throw new Error('Vé bán lại này không còn tồn tại hoặc đã được bán');
    }

    const ticket = await Ticket.findByPk(resaleItem.ticketId, { transaction: t });
    if (!ticket) throw new Error('Không tìm thấy vé tương ứng');

    const event = await Event.findByPk(ticket.eventId, { transaction: t });
    if (event && isSalesClosed(event.date, event.time)) {
      throw new Error('Sự kiện đã ngưng giao dịch vé bán lại');
    }

    if (event && event.eventType === 'online') {
      if (buyerId) {
        const existingTicket = await Ticket.findOne({
          where: {
            userId: buyerId,
            eventId: event.id,
            status: ['active', 'reselling']
          },
          transaction: t
        });
        if (existingTicket) {
          throw new Error('Bạn đã sở hữu vé của sự kiện trực tuyến này. Mỗi tài khoản chỉ được sở hữu tối đa 1 vé.');
        }
      }
    }

    const bookingId = `booking-${Date.now()}`;
    const repTicketId = `AP-${Math.floor(100000 + Math.random() * 900000)}`;

    await Booking.create({
      id: bookingId,
      userId: buyerId,
      eventId: ticket.eventId,
      zoneId: ticket.zoneId,
      count: 1,
      seats: JSON.stringify([ticket.seatNumber]),
      totalPrice: resaleItem.resalePrice,
      fullName,
      email,
      phone,
      ticketId: repTicketId,
      paymentStatus: 'Paid',
      bookingType: 'resale'
    }, { transaction: t });

    await ticket.update({
      userId: buyerId,
      status: 'active',
      purchaseType: 'resale'
    }, { transaction: t });

    await resaleItem.update({
      status: 'sold'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Mua vé bán lại thành công', ticketId: ticket.id });
  } catch (error) {
    try {
      if (t && !t.finished) await t.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    res.status(400).json({ error: error.message });
  }
};


export const getAdminResaleList = async (req, res) => {
  try {
    const list = await ResaleTicket.findAll({
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'seller' }
      ]
    });
    const formatted = list.map(t => {
      const data = t.toJSON();
      return {
        id: data.id,
        ticketId: data.ticketId,
        eventId: data.eventId,
        eventTitle: data.eventTitle || (data.event ? data.event.title : ''),
        zoneName: data.zoneName || '',
        seatInfo: data.seatInfo || '',
        originalPrice: data.originalPrice || 0,
        resalePrice: data.resalePrice || 0,
        sellerName: data.seller ? data.seller.fullName : 'Thành viên ẩn danh',
        status: data.status
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAdminResaleStatus = async (req, res) => {
  try {
    const item = await ResaleTicket.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy vé resale' });
    item.status = item.status === 'available' ? 'sold' : 'available';
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAdminResale = async (req, res) => {
  try {
    const item = await ResaleTicket.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy vé resale' });
    const ticket = await Ticket.findByPk(item.ticketId);
    if (ticket) {
      ticket.status = 'active';
      await ticket.save();
    }
    await item.destroy();
    res.json({ message: 'Xóa tin đăng bán lại thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelResaleListing = async (req, res) => {
  const { ticketId } = req.params;
  const { sellerId } = req.body;
  const t = await sequelize.transaction();
  try {
    const resaleItem = await ResaleTicket.findOne({
      where: { ticketId, sellerId, status: 'available' },
      transaction: t
    });
    if (!resaleItem) throw new Error('Không tìm thấy tin đăng bán hoặc vé đã được bán cho người khác');

    await resaleItem.update({ status: 'cancelled' }, { transaction: t });

    const ticket = await Ticket.findByPk(ticketId, { transaction: t });
    if (ticket) {
      await ticket.update({ status: 'active' }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Thu hồi vé thành công. Vé đã được trả lại vào ví của bạn.' });
  } catch (error) {
    try {
      if (t && !t.finished) await t.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    res.status(400).json({ error: error.message });
  }
};
