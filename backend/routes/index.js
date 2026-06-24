import express from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import resaleRoutes from './resaleRoutes.js';
import adminRoutes from './adminRoutes.js';

import { getCreators } from '../controllers/eventController.js';
import { getWalletTickets } from '../controllers/bookingController.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/resale', resaleRoutes);
router.use('/admin', adminRoutes);

router.get('/creators', getCreators);
router.get('/tickets/wallet', getWalletTickets);

export default router;
