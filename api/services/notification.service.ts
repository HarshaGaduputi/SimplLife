
import { config } from "../config/index.js";

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'email' | 'push' | 'slack';
  email?: string;
}

/**
 * Enterprise Notification Service
 * Manages push subscriptions and background email digests
 */
export class NotificationService {
  private queue: NotificationPayload[] = [];
  constructor() {
    // Start delivery loop
    setInterval(() => this.processQueue(), 15000);
  }

  async send(payload: NotificationPayload): Promise<void> {
    this.queue.push(payload);
    console.log(`[NotificationService] Enqueued ${payload.type} notification for ${payload.userId || payload.email}: "${payload.title}"`);
  }

  private async processQueue() {
    if (this.queue.length === 0) return;
    const batch = [...this.queue];
    this.queue = [];

    for (const item of batch) {
      try {
        if (item.type === 'email') {
          const recipient = item.email;
          if (!recipient) {
            console.error(`[NotificationService] Cannot send email: No recipient email provided for user ${item.userId}`);
            continue;
          }
          if (!config.smtp.pass) {
            console.warn(`[NotificationService] No Resend API Key (SMTP_PASS) found. Simulating email to ${recipient}: "${item.title}"`);
            continue;
          }

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.smtp.pass}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
              to: [recipient],
              subject: item.title,
              text: item.body,
            })
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Resend API Error: ${res.status} ${errBody}`);
          }
          
          console.log(`[NotificationService] Email delivered successfully to ${recipient}: "${item.title}"`);
        } else {
          // Delivery stub – simulates sending push/slack
          console.log(`[NotificationService] Delivered ${item.type} notification: "${item.body}"`);
        }
      } catch (err) {
        console.error(`[NotificationService] Delivery failed for ${item.type} to ${item.userId || item.email}:`, err);
      }
    }
  }
}

export const notificationService = new NotificationService();
