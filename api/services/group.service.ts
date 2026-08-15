import { groupRepository } from "../repositories/group.repository.js";
import { taskRepository } from "../repositories/task.repository.js";
import { ApiError } from "../utils/helpers.js";
import type { Group, Task, PriorityLevel } from "../../shared/types.js";

export class GroupService {
  static async list(userId: string): Promise<Group[]> {
    return groupRepository.list(userId);
  }

  static async create(userId: string, name: string): Promise<Group> {
    return groupRepository.create(userId, name);
  }

  static async getOwned(
    userId: string,
    groupId: string,
  ): Promise<Group> {
    const group = await groupRepository.getById(groupId);
    if (!group || group.userId !== userId) {
      throw new ApiError("Not found", 404);
    }
    return group;
  }

  static async update(
    userId: string,
    groupId: string,
    patch: { name?: string },
  ): Promise<Group> {
    await this.getOwned(userId, groupId);
    const updated = await groupRepository.update(groupId, patch);
    if (!updated) {
      throw new ApiError("Not found", 404);
    }
    return updated;
  }

  static async delete(userId: string, groupId: string): Promise<void> {
    await this.getOwned(userId, groupId);
    await groupRepository.delete(groupId);
  }

  static async listTasks(userId: string, groupId: string): Promise<Task[]> {
    await this.getOwned(userId, groupId);
    return taskRepository.listByGroup(groupId);
  }

  static async createTask(
    userId: string,
    groupId: string,
    params: {
      title: string;
      description?: string | null;
      order?: number;
      templateId?: string | null;
      priority?: PriorityLevel | null;
      dueDate?: string | null;
    },
  ): Promise<Task> {
    await this.getOwned(userId, groupId);
    return taskRepository.create({
      groupId,
      ...params,
    });
  }
}
