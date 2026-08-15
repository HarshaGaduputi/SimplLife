import { templateRepository } from "../repositories/template.repository.js";
import { groupRepository } from "../repositories/group.repository.js";
import { taskRepository } from "../repositories/task.repository.js";
import { subtaskRepository } from "../repositories/subtask.repository.js";
import { ApiError } from "../utils/helpers.js";
import type { Template, Task } from "../../shared/types.js";

export class TemplateService {
  static async list(): Promise<Template[]> {
    return templateRepository.list();
  }

  static async apply(params: {
    userId: string;
    templateId: string;
    groupId: string;
    mainTaskName: string;
  }): Promise<Task> {
    const template = await templateRepository.getById(params.templateId);
    if (!template) {
      throw new ApiError("Template not found", 404);
    }

    const group = await groupRepository.getById(params.groupId);
    if (!group || group.userId !== params.userId) {
      throw new ApiError("Group not found", 404);
    }

    const task = await taskRepository.create({
      groupId: params.groupId,
      title: params.mainTaskName,
      templateId: params.templateId,
    });

    const sortedSubs = [...template.subtasks].sort((a, b) => a.order - b.order);
    for (const def of sortedSubs) {
      await subtaskRepository.create({
        taskId: task.id,
        title: def.title,
        order: def.order,
      });
    }

    const refreshed = await taskRepository.getById(task.id);
    if (!refreshed) {
      throw new ApiError("Task not found after creation", 500);
    }
    return refreshed;
  }
}
