import express from 'express';
import { getEvents, getCreators } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/creators', getCreators);

export default router;
