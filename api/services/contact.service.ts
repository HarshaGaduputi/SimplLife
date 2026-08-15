import { contactRepository } from "../repositories/contact.repository.js";

export class ContactService {
  static async sendMessage(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await contactRepository.createMessage(params);
  }
}
