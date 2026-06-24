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

const getZoneLayout = (capacity = 0) => {
  const total = Math.max(1, Number(capacity) || 0);
  const cols = Math.min(total, 10);
  return { rows: Math.ceil(total / cols), cols };
};

const normalizeEventZones = (zones = []) => zones.map((zone) => {
  const base = { ...zone, price: Number(zone.price) || 0, availableTickets: Number(zone.availableTickets) || 0, isStanding: !!zone.isStanding };
  if (base.isStanding) return { ...base, rows: null, cols: null };
  const rows = Number(zone.rows) || 0;
  const cols = Number(zone.cols) || 0;
  if (rows > 0 && cols > 0) return { ...base, rows, cols, availableTickets: rows * cols };
  const layout = getZoneLayout(base.availableTickets);
  return { ...base, ...layout, availableTickets: layout.rows * layout.cols };
});

export const createEvent = async (req, res) => {
  const { title, description, category, date, time, location, priceRange, image, badge, theme, isFeatured, isTrending, zones, creatorId, organizerId, status, eventType, onlineLink, platform, onlinePassword, onlineInstructions } = req.body;
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
      status: status || 'pending',
      eventType: eventType || 'live',
      onlineLink: onlineLink || null,
      platform: platform || null,
      onlinePassword: onlinePassword || null,
      onlineInstructions: onlineInstructions || null
    }, { transaction: t });

    const normalizedZones = normalizeEventZones(zones);
    if (normalizedZones.length > 0) {
      for (const zone of normalizedZones) {
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
  const { title, description, category, date, time, location, priceRange, image, badge, theme, isFeatured, isTrending, zones, creatorId, organizerId, status, eventType, onlineLink, platform, onlinePassword, onlineInstructions } = req.body;
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
      creatorId: creatorId ? creatorId : event.creatorId,
      organizerId: organizerId ? organizerId : event.organizerId,
      status: status !== undefined ? status : event.status,
      eventType: eventType !== undefined ? eventType : event.eventType,
      onlineLink: onlineLink !== undefined ? (onlineLink || null) : event.onlineLink,
      platform: platform !== undefined ? (platform || null) : event.platform,
      onlinePassword: onlinePassword !== undefined ? (onlinePassword || null) : event.onlinePassword,
      onlineInstructions: onlineInstructions !== undefined ? (onlineInstructions || null) : event.onlineInstructions
    }, { transaction: t });

    if (zones) {
      const normalizedZones = normalizeEventZones(zones);
      await Zone.destroy({ where: { eventId: event.id }, transaction: t });
      for (const zone of normalizedZones) {
        await Zone.create({
          id: zone.id && zone.id.startsWith('zone-') ? zone.id : `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
