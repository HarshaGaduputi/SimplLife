/**
 * Vercel deploy entry handler, for serverless deployment, please don't modify this file
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from './app.js';
import { runMigrations } from './db/migrate.js';

let migrationsReady: Promise<void> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  migrationsReady ??= runMigrations();
  await migrationsReady;
  return app(req, res);
}
