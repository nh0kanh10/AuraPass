import { sequelize } from './models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Events' AND COLUMN_NAME='eventType')
   ALTER TABLE Events ADD eventType NVARCHAR(50) DEFAULT 'live'`,

  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Events' AND COLUMN_NAME='onlineLink')
   ALTER TABLE Events ADD onlineLink NVARCHAR(1000) NULL`,

  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Events' AND COLUMN_NAME='platform')
   ALTER TABLE Events ADD platform NVARCHAR(100) NULL`,

  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Events' AND COLUMN_NAME='onlinePassword')
   ALTER TABLE Events ADD onlinePassword NVARCHAR(255) NULL`,

  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Events' AND COLUMN_NAME='onlineInstructions')
   ALTER TABLE Events ADD onlineInstructions NVARCHAR(2000) NULL`
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');
    for (const sql of migrations) {
      await sequelize.query(sql);
      const col = sql.match(/COLUMN_NAME='(\w+)'/)[1];
      console.log(`✓ ${col}`);
    }
    console.log('Migration done.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await sequelize.close();
  }
})();
