import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[server] CRM API listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});
