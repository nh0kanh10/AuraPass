import express from 'express';
import { getEvents, getCreators, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/creators', getCreators);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
