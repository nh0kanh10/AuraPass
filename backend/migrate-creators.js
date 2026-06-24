import { sequelize } from './models/index.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.query(`
      UPDATE Creators 
      SET userId = 'user-organizer-1' 
      WHERE id = 'chillies'
    `);

    console.log('Successfully linked user-organizer-1 to Creator "chillies".');
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    await sequelize.close();
  }
};

run();
