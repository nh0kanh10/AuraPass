import express from 'express';
import { createResaleList, getResaleList, buyResaleTicket, cancelResaleListing } from '../controllers/resaleController.js';

const router = express.Router();

router.post('/list', createResaleList);
router.get('/', getResaleList);
router.post('/buy', buyResaleTicket);
router.delete('/cancel/:ticketId', cancelResaleListing);

export default router;
