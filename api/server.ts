import app from './app.js';
import { initCronJobs } from './cron.js';
import { runMigrations } from './db/migrate.js';

const PORT = process.env.PORT || 3002;

runMigrations().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
    initCronJobs();
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('[SimplLife] Startup failed:', err);
  process.exit(1);
});

export default app;