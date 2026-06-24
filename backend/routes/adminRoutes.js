import express from 'express';
import multer from 'multer';
import path from 'path';
import { createEvent, updateEvent, deleteEvent, createCreator, updateCreator, deleteCreator } from '../controllers/eventController.js';
import { getAdminBookings, updateBookingPayment, deleteBooking } from '../controllers/bookingController.js';
import { getAdminResaleList, updateAdminResaleStatus, deleteAdminResale } from '../controllers/resaleController.js';
import { getAdminUsers, updateUserRole, deleteUser, createAdminUser, updateUserPassword } from '../controllers/authController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Vui lòng chọn file' });
  }
  res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

router.post('/creators', createCreator);
router.put('/creators/:id', updateCreator);
router.delete('/creators/:id', deleteCreator);

router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/payment', updateBookingPayment);
router.delete('/bookings/:id', deleteBooking);

router.get('/resale', getAdminResaleList);
router.put('/resale/:id/status', updateAdminResaleStatus);
router.delete('/resale/:id', deleteAdminResale);

router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/password', updateUserPassword);
router.delete('/users/:id', deleteUser);

export default router;
