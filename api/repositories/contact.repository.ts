import { getDb } from "../db.js";

export const contactRepository = {
  async createMessage(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const db = getDb();
    return db.createContactMessage(params);
  },
};
