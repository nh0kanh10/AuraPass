import { ResaleTicket, Ticket, Event, sequelize } from '../models/index.js';
import { isEventStarted } from './dateHelper.js';

export const cleanupExpiredResales = async () => {
  try {
    const list = await ResaleTicket.findAll({
      where: { status: 'available' },
      include: [{ model: Event, as: 'event' }]
    });

    const expiredItems = [];
    for (const item of list) {
      const event = item.event;
      if (event && isEventStarted(event.date, event.time)) {
        expiredItems.push(item);
      }
    }

    if (expiredItems.length === 0) return { cleanedCount: 0 };

    let cleanedCount = 0;
    for (const item of expiredItems) {
      const t = await sequelize.transaction();
      try {
        await item.update({ status: 'cancelled' }, { transaction: t });
        const ticket = await Ticket.findByPk(item.ticketId, { transaction: t });
        if (ticket) {
          await ticket.update({ status: 'active' }, { transaction: t });
        }
        await t.commit();
        cleanedCount++;
      } catch (e) {
        console.error(`Error auto-cancelling expired resale ticket ${item.id}:`, e);
        if (t && !t.finished) await t.rollback();
      }
    }

    if (cleanedCount > 0) {
      console.log(`[resale-cleanup] Đã tự động thu hồi ${cleanedCount} vé bán lại quá hạn.`);
    }
    return { cleanedCount };
  } catch (error) {
    console.error("Error in cleanupExpiredResales:", error);
    return { error: error.message };
  }
};
