import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import apiRoutes from './routes/index.js';
import { cancelExpiredBookings } from './controllers/bookingController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    setInterval(async () => {
      try {
        const { cancelled } = await cancelExpiredBookings(30);
        if (cancelled > 0) console.log(`[Auto-expire] Đã hủy ${cancelled} đơn chưa thanh toán quá hạn`);
      } catch (err) {
        console.error('[Auto-expire] Error:', err.message);
      }
    }, 5 * 60 * 1000);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
});
