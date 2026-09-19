import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository.js";
import { signToken } from "../middleware/auth.js";
import { ApiError } from "../utils/helpers.js";
import type { User } from "../../shared/types.js";

export class AuthService {
  static async register(params: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(params.email);
    if (existing) {
      throw new ApiError("Email already in use", 409);
    }
    const passwordHash = await bcrypt.hash(params.password, 10);
    const user = await userRepository.create({
      name: params.name,
      email: params.email,
      passwordHash,
    });
    const token = signToken(user.id);
    return { token, user };
  }

  static async login(params: { email: string; password: string }) {
    const record = await userRepository.findByEmail(params.email);
    if (!record) {
      throw new ApiError("Invalid credentials", 401);
    }
    const ok = await bcrypt.compare(params.password, record.passwordHash);
    if (!ok) {
      throw new ApiError("Invalid credentials", 401);
    }
    const token = signToken(record.user.id);
    return { token, user: record.user };
  }

  static async getMe(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError("Unauthorized", 401);
    }
    return user;
  }

  static async updateMe(
    userId: string,
    patch: { name?: string; digestEmailsEnabled?: boolean },
  ): Promise<User> {
    const updated = await userRepository.update(userId, patch);
    if (!updated) {
      throw new ApiError("User not found", 404);
    }
    return updated;
  }

  static async deleteMe(userId: string): Promise<void> {
    const deleted = await userRepository.delete(userId);
    if (!deleted) {
      throw new ApiError("User not found or deletion failed", 404);
    }
  }
}
