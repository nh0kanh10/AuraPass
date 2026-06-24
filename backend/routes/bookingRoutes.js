import express from 'express';
import { createBooking, getWalletTickets } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/wallet', getWalletTickets);

export default router;
