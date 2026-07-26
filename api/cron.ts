import { getDb } from "./db.js";

export function initCronJobs() {
  console.log("[SimplLife Cron] Registered daily background tasks.");

  // Daily trash cleanup (runs every 24 hours)
  setInterval(() => {
    void (async () => {
      try {
        const db = getDb();
        const deleted = await db.autoEmptyTrashOlderThanDays(30);
        if (deleted > 0) {
          console.log(`[SimplLife Cron] Trash auto-emptied: ${deleted} records deleted.`);
        }
      } catch (err) {
        console.error("[SimplLife Cron] Error auto-emptying trash:", err);
      }
    })();
  }, 24 * 60 * 60 * 1000);

  // Daily digest email scheduler log
  setInterval(() => {
    void (async () => {
      try {
        const db = getDb();
        const users = await db.listAllUsers();
        const enabled = users.filter((u) => u.digestEmailsEnabled !== false);
        console.log(`[SimplLife Cron] Daily digest email check for ${enabled.length} users.`);
      } catch (err) {
        console.error("[SimplLife Cron] Error sending daily digest:", err);
      }
    })();
  }, 24 * 60 * 60 * 1000);
}
