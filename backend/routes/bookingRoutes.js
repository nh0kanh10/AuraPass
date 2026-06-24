import express from 'express';
import { createBooking, getWalletTickets, getTakenSeats } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/wallet', getWalletTickets);
router.get('/taken-seats', getTakenSeats);

export default router;
