import { taskRepository } from "../repositories/task.repository.js";
import { subtaskRepository } from "../repositories/subtask.repository.js";
import { groupRepository } from "../repositories/group.repository.js";
import { activityRepository } from "../repositories/activity.repository.js";
import { ApiError } from "../utils/helpers.js";
import { config } from "../config/index.js";
import type { Task, Subtask } from "../../shared/types.js";

export class TaskService {
  static async ensureOwnsTask(
    userId: string,
    taskId: string,
  ): Promise<{ task: Task }> {
    const task = await taskRepository.getById(taskId);
    if (!task || task.deletedAt) {
      throw new ApiError("Not found", 404);
    }
    const group = await groupRepository.getById(task.groupId);
    if (!group || group.userId !== userId || group.deletedAt) {
      throw new ApiError("Not found", 404);
    }
    return { task };
  }

  static async ensureOwnsSubtask(
    userId: string,
    subtaskId: string,
  ): Promise<{ subtask: Subtask; task: Task }> {
    const subtask = await subtaskRepository.getById(subtaskId);
    if (!subtask || subtask.deletedAt) {
      throw new ApiError("Not found", 404);
    }
    const { task } = await this.ensureOwnsTask(userId, subtask.taskId);
    return { subtask, task };
  }

  static async getUpcoming(userId: string) {
    const allTasks = await taskRepository.listAllForUser(userId);
    const todayStr = new Date().toISOString().split("T")[0];

    const upcoming = allTasks
      .filter((t) => !t.completed && t.dueDate)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));

    return { today: todayStr, tasks: upcoming };
  }

  /**
   * Retrieve all tasks for a user (including completed ones).
   */
  static async listAll(userId: string) {
    return taskRepository.listAllForUser(userId);
  }

  static async update(
    userId: string,
    taskId: string,
    patch: Parameters<typeof taskRepository.update>["1"],
  ): Promise<Task> {
    await this.ensureOwnsTask(userId, taskId);
    const updated = await taskRepository.update(taskId, patch);
    if (!updated) {
      throw new ApiError("Not found", 404);
    }
    return updated;
  }

  static async complete(userId: string, taskId: string): Promise<Task> {
    return this.update(userId, taskId, { completed: true });
  }

  static async uncomplete(userId: string, taskId: string): Promise<Task> {
    return this.update(userId, taskId, { completed: false });
  }

  static async delete(userId: string, taskId: string): Promise<void> {
    await this.ensureOwnsTask(userId, taskId);
    await taskRepository.delete(taskId);
  }

  static async createSubtask(
    userId: string,
    taskId: string,
    params: { title: string; order?: number },
  ): Promise<Subtask> {
    await this.ensureOwnsTask(userId, taskId);
    return subtaskRepository.create({
      taskId,
      ...params,
    });
  }

  static async updateSubtask(
    userId: string,
    subtaskId: string,
    patch: Parameters<typeof subtaskRepository.update>["1"],
  ): Promise<Subtask> {
    await this.ensureOwnsSubtask(userId, subtaskId);
    const updated = await subtaskRepository.update(subtaskId, patch);
    if (!updated) {
      throw new ApiError("Not found", 404);
    }
    return updated;
  }

  static async deleteSubtask(userId: string, subtaskId: string): Promise<void> {
    await this.ensureOwnsSubtask(userId, subtaskId);
    await subtaskRepository.delete(subtaskId);
  }

  private static generateFallbackSubtasks(taskTitle: string): string[] {
    const lower = taskTitle.toLowerCase();
    if (lower.includes("blog") || lower.includes("write") || lower.includes("article")) {
      return [
        "Outline key points & research topic",
        "Draft initial content paragraphs",
        "Proofread and publish article",
      ];
    } else if (lower.includes("event") || lower.includes("party") || lower.includes("plan")) {
      return [
        "Confirm guest list & date",
        "Book venue or arrange space",
        "Prepare agenda & food/beverages",
      ];
    } else if (lower.includes("study") || lower.includes("exam") || lower.includes("test")) {
      return [
        "Review chapter summary notes",
        "Complete practice problems",
        "Self-test on flashcards",
      ];
    } else if (lower.includes("bug") || lower.includes("fix") || lower.includes("issue")) {
      return [
        "Reproduce bug and inspect logs",
        "Implement fix & write regression test",
        "Verify build and merge PR",
      ];
    } else if (lower.includes("shop") || lower.includes("buy") || lower.includes("grocery")) {
      return [
        "List items needed",
        "Compare prices or check store availability",
        "Pick up items and save receipt",
      ];
    } else {
      return [
        `Gather initial requirements for ${taskTitle}`,
        `Execute main steps for ${taskTitle}`,
        `Review & double-check final result`,
      ];
    }
  }

  static async aiSplit(userId: string, taskId: string): Promise<Subtask[]> {
    const { task } = await this.ensureOwnsTask(userId, taskId);

    if ((task.subtasks || []).length >= 5) {
      throw new ApiError(
        "Task already has 5 or more subtasks. Remove some before generating more.",
        400,
      );
    }

    let subtaskNames: string[] = [];
    const apiKey = config.openai.apiKey;

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  'You are a task planning assistant. Given a task name and optional description, generate between 3 and 5 specific, actionable subtasks that logically break down the main task. Return ONLY a JSON array of strings, no explanation, no markdown, no numbering. Example output: ["Book the venue","Send invitations","Order catering"]',
              },
              {
                role: "user",
                content: `Task: ${task.title}. Description: ${task.description || "None"}.`,
              },
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const rawText = json.choices?.[0]?.message?.content || "";
          const cleaned = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          subtaskNames = JSON.parse(cleaned);
        }
      } catch (err) {
        console.warn("[AI Split] OpenAI request error, using smart fallback:", err);
      }
    }

    if (!Array.isArray(subtaskNames) || subtaskNames.length === 0) {
      subtaskNames = this.generateFallbackSubtasks(task.title);
    }

    const createdSubtasks: Subtask[] = [];
    let startPos = (task.subtasks || []).length;

    for (const name of subtaskNames) {
      const created = await subtaskRepository.create({
        taskId: task.id,
        title: name,
        order: startPos++,
      });
      createdSubtasks.push(created);
    }

    await activityRepository.log({
      userId,
      action: "ai_split",
      entityType: "task",
      entityName: task.title,
      detail: `AI generated ${createdSubtasks.length} subtasks.`,
    });

    return createdSubtasks;
  }
}
