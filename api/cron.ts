import { TrashService } from "./services/trash.service.js";
import { userRepository } from "./repositories/user.repository.js";
import { logger } from "./utils/logger.js";
import { TaskService } from "./services/task.service.js";
import { notificationService } from "./services/notification.service.js";

export function initCronJobs() {
  logger.info("Registered daily background tasks.");

  setInterval(() => {
    void (async () => {
      try {
        const deleted = await TrashService.autoEmpty(30);
        if (deleted > 0) {
          logger.info(`Trash auto-emptied: ${deleted} records deleted.`);
        }
      } catch (err) {
        logger.error("Error auto-emptying trash:", err);
      }
    })();
  }, 24 * 60 * 60 * 1000);

  setInterval(() => {
    void (async () => {
      try {
        const users = await userRepository.listAll();
        const enabled = users.filter((u) => u.digestEmailsEnabled !== false);
        logger.info(`Daily digest email check for ${enabled.length} users.`);

        for (const user of enabled) {
          try {
            const { today, tasks } = await TaskService.getUpcoming(user.id);
            // filter tasks due today or overdue (dueDate <= today)
            const dueTodayOrOverdue = tasks.filter(
              (t) => t.dueDate && t.dueDate.split("T")[0] <= today
            );
            if (dueTodayOrOverdue.length === 0) continue;

            const listStr = dueTodayOrOverdue
              .map((t) => {
                const dateOnly = t.dueDate ? t.dueDate.split("T")[0] : "";
                return `- ${t.title} (Due: ${dateOnly})`;
              })
              .join("\n");

            const body = `Here's what's on your plate today, ${user.name}:\n\n${listStr}`;

            await notificationService.send({
              userId: user.id,
              email: user.email,
              title: "Your SimplLife Daily Digest",
              body,
              type: "email",
            });
          } catch (userErr) {
            logger.error(`Error processing digest for user ${user.id}:`, userErr);
          }
        }
      } catch (err) {
        logger.error("Error sending daily digest:", err);
      }
    })();
  }, 24 * 60 * 60 * 1000);
}
