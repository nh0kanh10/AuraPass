import express from 'express';
import { login, register, updateProfile, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/:id/profile', updateProfile);
router.put('/:id/change-password', changePassword);

export default router;
