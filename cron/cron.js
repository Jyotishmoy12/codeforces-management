import cron from 'node-cron';
import rundailySync from './syncStudents.js';
console.log("🕑 Cron job scheduled to run every day at 2 AM");
// Run every day at 2 AM
// Run every minute (for testing)
cron.schedule('* * * * *', async () => {
  console.log("🔔 Cron job triggered");
  await rundailySync();
});

