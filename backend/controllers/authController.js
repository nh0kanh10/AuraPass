import { User, Ticket, Booking, ResaleTicket, sequelize } from '../models/index.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  const { username, password, email, fullName, phone } = req.body;
  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    const newUser = await User.create({
      id: `user-${Date.now()}`,
      username,
      password,
      email,
      fullName,
      phone,
      role: 'client'
    });
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const list = await User.findAll({
      attributes: ['id', 'username', 'email', 'phone', 'fullName', 'role'],
      order: [['username', 'ASC']]
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    
    if (user.role === 'client') {
      user.role = 'organizer';
    } else if (user.role === 'organizer') {
      user.role = 'admin';
    } else {
      user.role = 'client';
    }
    
    await user.save();
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    await ResaleTicket.destroy({ where: { sellerId: user.id }, transaction: t });
    await Ticket.destroy({ where: { userId: user.id }, transaction: t });
    await Booking.destroy({ where: { userId: user.id }, transaction: t });
    await user.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Xóa tài khoản người dùng thành công' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const createAdminUser = async (req, res) => {
  const { username, password, email, fullName, phone, role } = req.body;
  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    const newUser = await User.create({
      id: `user-${Date.now()}`,
      username,
      password,
      email,
      fullName,
      phone,
      role: role || 'client'
    });
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Cập nhật mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

