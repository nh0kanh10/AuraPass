import { Event, Creator, Zone, Ticket, Booking, ResaleTicket, sequelize } from '../models/index.js';

export const getEvents = async (req, res) => {
  try {
    const { organizerId, status } = req.query;
    const where = {};
    if (organizerId) {
      if (organizerId === 'undefined' || organizerId === 'null' || organizerId === '') {
        return res.json([]);
      }
      where.organizerId = organizerId;
    } else if (status) {
      if (status !== 'all') {
        where.status = status;
      }
    } else {
      where.status = 'approved';
    }
    const events = await Event.findAll({
      where,
      include: [{ model: Zone, as: 'zones' }]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCreators = async (req, res) => {
  try {
    const { userId } = req.query;
    const where = {};
    if (userId) {
      where.userId = userId;
    }
    const creators = await Creator.findAll({
      where,
      include: [{ model: Event, as: 'events' }]
    });
    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req, res) => {
  const { title, description, category, date, time, location, priceRange, image, badge, theme, isFeatured, isTrending, zones, creatorId, organizerId, status } = req.body;
  const t = await sequelize.transaction();
  try {
    const eventId = `event-${Date.now()}`;
    const newEvent = await Event.create({
      id: eventId,
      title,
      description,
      category,
      date,
      time,
      location,
      priceRange,
      image,
      badge,
      theme,
      isFeatured: isFeatured ?? false,
      isTrending: isTrending ?? false,
      creatorId: creatorId || null,
      organizerId: organizerId || null,
      status: status || 'pending'
    }, { transaction: t });

    if (zones && zones.length > 0) {
      for (const zone of zones) {
        await Zone.create({
          id: zone.id || `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          eventId,
          name: zone.name,
          price: zone.price,
          isStanding: zone.isStanding,
          availableTickets: zone.availableTickets,
          rows: zone.rows || null,
          cols: zone.cols || null
        }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json(newEvent);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { title, description, category, date, time, location, priceRange, image, badge, theme, isFeatured, isTrending, zones, creatorId, organizerId, status } = req.body;
  const t = await sequelize.transaction();
  try {
    const event = await Event.findByPk(req.params.id, { transaction: t });
    if (!event) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    await event.update({
      title: title !== undefined ? title : event.title,
      description: description !== undefined ? description : event.description,
      category: category !== undefined ? category : event.category,
      date: date !== undefined ? date : event.date,
      time: time !== undefined ? time : event.time,
      location: location !== undefined ? location : event.location,
      priceRange: priceRange !== undefined ? priceRange : event.priceRange,
      image: image !== undefined ? image : event.image,
      badge: badge !== undefined ? badge : event.badge,
      theme: theme !== undefined ? theme : event.theme,
      isFeatured: isFeatured !== undefined ? isFeatured : event.isFeatured,
      isTrending: isTrending !== undefined ? isTrending : event.isTrending,
      creatorId: creatorId !== undefined ? creatorId : event.creatorId,
      organizerId: organizerId !== undefined ? organizerId : event.organizerId,
      status: status !== undefined ? status : event.status
    }, { transaction: t });

    if (zones) {
      await Zone.destroy({ where: { eventId: event.id }, transaction: t });
      for (const zone of zones) {
        await Zone.create({
          id: zone.id.startsWith('zone-') ? zone.id : `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          eventId: event.id,
          name: zone.name,
          price: zone.price,
          isStanding: zone.isStanding,
          availableTickets: zone.availableTickets,
          rows: zone.rows || null,
          cols: zone.cols || null
        }, { transaction: t });
      }
    }

    await t.commit();
    res.json(event);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const event = await Event.findByPk(req.params.id, { transaction: t });
    if (!event) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    await Zone.destroy({ where: { eventId: event.id }, transaction: t });
    await Ticket.destroy({ where: { eventId: event.id }, transaction: t });
    await Booking.destroy({ where: { eventId: event.id }, transaction: t });
    await ResaleTicket.destroy({ where: { eventId: event.id }, transaction: t });
    
    await event.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Xóa sự kiện thành công' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const createCreator = async (req, res) => {
  const { name, type, filterType, logo, icon, rating, followers, eventCount, location, description, accentColor, stats } = req.body;
  try {
    const id = `creator-${Date.now()}`;
    const newCreator = await Creator.create({
      id,
      name,
      type,
      filterType,
      logo,
      icon,
      rating: rating ? parseFloat(rating) : null,
      followers,
      eventCount,
      location,
      description,
      accentColor,
      stats
    });
    res.status(201).json(newCreator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCreator = async (req, res) => {
  const { name, type, filterType, logo, icon, rating, followers, eventCount, location, description, accentColor, stats } = req.body;
  try {
    const creator = await Creator.findByPk(req.params.id);
    if (!creator) return res.status(404).json({ error: 'Không tìm thấy nhà tổ chức' });

    await creator.update({
      name,
      type,
      filterType,
      logo,
      icon,
      rating: rating ? parseFloat(rating) : null,
      followers,
      eventCount,
      location,
      description,
      accentColor,
      stats
    });
    res.json(creator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCreator = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const creator = await Creator.findByPk(req.params.id, { transaction: t });
    if (!creator) {
      await t.rollback();
      return res.status(404).json({ error: 'Không tìm thấy nhà tổ chức' });
    }

    await Event.update(
      { creatorId: null },
      { where: { creatorId: creator.id }, transaction: t }
    );

    await creator.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Xóa nhà tổ chức thành công' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
