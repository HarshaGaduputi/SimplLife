import { getDb } from "../db.js";
import type { User } from "../../shared/types.js";

export const userRepository = {
  async create(params: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const db = getDb();
    return db.createUser(params);
  },

  async findByEmail(email: string): Promise<{
    user: User;
    passwordHash: string;
  } | null> {
    const db = getDb();
    return db.findUserByEmail(email);
  },

  async findById(id: string): Promise<User | null> {
    const db = getDb();
    return db.findUserById(id);
  },

  async update(
    id: string,
    patch: { name?: string; digestEmailsEnabled?: boolean },
  ): Promise<User | null> {
    const db = getDb();
    return db.updateUser(id, patch);
  },

  async listAll(): Promise<User[]> {
    const db = getDb();
    return db.listAllUsers();
  },
};
