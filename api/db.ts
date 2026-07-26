import type {
  ActivityLog,
  ExportData,
  Group,
  PriorityLevel,
  Subtask,
  Task,
  Template,
  TrashData,
  User,
} from "../shared/types.js";
import { SEED_TEMPLATES } from "./lib/seedTemplates.js";

type PasswordHash = string;

function uid(prefix = "id"): string {
  return (
    prefix +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

function now(): string {
  return new Date().toISOString();
}

interface DBState {
  users: Map<string, { user: User; passwordHash: PasswordHash }>;
  usersByEmail: Map<string, string>;
  groups: Map<string, Group>;
  tasks: Map<string, Task>;
  subtasks: Map<string, Subtask>;
  templates: Map<string, Template>;
  contactMessages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }>;
  activityLogs: ActivityLog[];
}

class MemoryDatabase {
  private state: DBState;

  constructor() {
    this.state = {
      users: new Map(),
      usersByEmail: new Map(),
      groups: new Map(),
      tasks: new Map(),
      subtasks: new Map(),
      templates: new Map(),
      contactMessages: [],
      activityLogs: [],
    };
    for (const t of SEED_TEMPLATES) {
      this.state.templates.set(t.id, { ...t });
    }
  }

  // ===== Activity Logs =====
  async logActivity(params: {
    userId: string;
    action: string;
    entityType: "group" | "task" | "subtask" | "template" | "user";
    entityName: string;
    detail?: string | null;
  }): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: uid("log"),
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityName: params.entityName,
      detail: params.detail ?? null,
      createdAt: now(),
    };
    this.state.activityLogs.unshift(log);
    return log;
  }

  async listActivity(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<ActivityLog[]> {
    const userLogs = this.state.activityLogs.filter((l) => l.userId === userId);
    return userLogs.slice(offset, offset + limit);
  }

  // ===== Users =====
  async createUser(params: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const id = uid("usr");
    const user: User = {
      id,
      name: params.name,
      email: params.email,
      digestEmailsEnabled: true,
      createdAt: now(),
    };
    this.state.users.set(id, { user, passwordHash: params.passwordHash });
    this.state.usersByEmail.set(params.email.toLowerCase(), id);
    return user;
  }

  async findUserByEmail(email: string): Promise<{
    user: User;
    passwordHash: string;
  } | null> {
    const id = this.state.usersByEmail.get(email.toLowerCase());
    if (!id) return null;
    const record = this.state.users.get(id);
    return record ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const record = this.state.users.get(id);
    return record ? record.user : null;
  }

  async updateUser(
    id: string,
    patch: { name?: string; digestEmailsEnabled?: boolean },
  ): Promise<User | null> {
    const record = this.state.users.get(id);
    if (!record) return null;
    const updatedUser: User = { ...record.user, ...patch };
    this.state.users.set(id, { ...record, user: updatedUser });
    return updatedUser;
  }

  async listAllUsers(): Promise<User[]> {
    return Array.from(this.state.users.values()).map((r) => r.user);
  }

  // ===== Templates =====
  async listTemplates(): Promise<Template[]> {
    return Array.from(this.state.templates.values());
  }

  async getTemplate(id: string): Promise<Template | null> {
    return this.state.templates.get(id) ?? null;
  }

  // ===== Groups =====
  async listGroups(userId: string): Promise<Group[]> {
    const out: Group[] = [];
    for (const g of this.state.groups.values()) {
      if (g.userId === userId && !g.deletedAt) out.push(g);
    }
    out.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
    return out;
  }

  async getGroup(id: string): Promise<Group | null> {
    const g = this.state.groups.get(id);
    return g ?? null;
  }

  async createGroup(userId: string, name: string): Promise<Group> {
    const existing = await this.listGroups(userId);
    const id = uid("grp");
    const group: Group = {
      id,
      userId,
      name,
      order: existing.length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.state.groups.set(id, group);
    await this.logActivity({
      userId,
      action: "created",
      entityType: "group",
      entityName: name,
    });
    return group;
  }

  async updateGroup(
    id: string,
    patch: { name?: string; order?: number },
  ): Promise<Group | null> {
    const current = this.state.groups.get(id);
    if (!current) return null;
    const updated: Group = { ...current, ...patch, updatedAt: now() };
    this.state.groups.set(id, updated);
    if (patch.name && patch.name !== current.name) {
      await this.logActivity({
        userId: current.userId,
        action: "renamed",
        entityType: "group",
        entityName: patch.name,
        detail: `renamed from '${current.name}' to '${patch.name}'`,
      });
    }
    return updated;
  }

  async deleteGroup(id: string): Promise<void> {
    const current = this.state.groups.get(id);
    if (!current) return;
    const time = now();
    this.state.groups.set(id, { ...current, deletedAt: time, updatedAt: time });
    // soft delete child tasks and subtasks
    for (const t of Array.from(this.state.tasks.values())) {
      if (t.groupId === id) {
        this.state.tasks.set(t.id, { ...t, deletedAt: time, updatedAt: time });
        for (const s of Array.from(this.state.subtasks.values())) {
          if (s.taskId === t.id) {
            this.state.subtasks.set(s.id, {
              ...s,
              deletedAt: time,
              updatedAt: time,
            });
          }
        }
      }
    }
    await this.logActivity({
      userId: current.userId,
      action: "deleted",
      entityType: "group",
      entityName: current.name,
      detail: "moved to Trash",
    });
  }

  // ===== Tasks =====
  private hydrateTask(t: Task): Task {
    const subtasks = Array.from(this.state.subtasks.values())
      .filter((s) => s.taskId === t.id && !s.deletedAt)
      .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
    return { ...t, subtasks };
  }

  async listTasksByGroup(groupId: string): Promise<Task[]> {
    const out: Task[] = [];
    for (const t of this.state.tasks.values()) {
      if (t.groupId === groupId && !t.deletedAt) out.push(this.hydrateTask(t));
    }
    out.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
    return out;
  }

  async listAllTasksForUser(userId: string): Promise<Task[]> {
    const groups = await this.listGroups(userId);
    const groupIds = new Set(groups.map((g) => g.id));
    const out: Task[] = [];
    for (const t of this.state.tasks.values()) {
      if (groupIds.has(t.groupId) && !t.deletedAt) {
        out.push(this.hydrateTask(t));
      }
    }
    return out;
  }

  async getTask(id: string): Promise<Task | null> {
    const t = this.state.tasks.get(id);
    if (!t) return null;
    return this.hydrateTask(t);
  }

  async createTask(params: {
    groupId: string;
    title: string;
    description?: string | null;
    order?: number;
    templateId?: string | null;
    priority?: PriorityLevel | null;
    dueDate?: string | null;
  }): Promise<Task> {
    const group = this.state.groups.get(params.groupId);
    if (!group) throw new Error("Group not found");
    const groupTasks = (await this.listTasksByGroup(params.groupId)).filter(
      (t) => !t.completed,
    );
    const id = uid("tsk");
    const task: Task = {
      id,
      groupId: params.groupId,
      title: params.title,
      description: params.description ?? null,
      completed: false,
      completedAt: null,
      order: params.order ?? groupTasks.length,
      templateId: params.templateId ?? null,
      priority: params.priority ?? "none",
      dueDate: params.dueDate ?? null,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
      subtasks: [],
    };
    this.state.tasks.set(id, task);
    await this.logActivity({
      userId: group.userId,
      action: "created",
      entityType: "task",
      entityName: params.title,
      detail: `added to group '${group.name}'`,
    });
    return this.hydrateTask(task);
  }

  async updateTask(
    id: string,
    patch: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      order?: number;
      templateId?: string | null;
      priority?: PriorityLevel | null;
      dueDate?: string | null;
    },
  ): Promise<Task | null> {
    const current = this.state.tasks.get(id);
    if (!current) return null;
    const group = this.state.groups.get(current.groupId);
    const userId = group?.userId ?? "";

    const merged: Task = {
      ...current,
      ...patch,
      completedAt:
        patch.completed === true && !current.completed
          ? now()
          : patch.completed === false
            ? null
            : current.completedAt,
      updatedAt: now(),
    };
    this.state.tasks.set(id, merged);

    if (userId) {
      if (patch.completed !== undefined && patch.completed !== current.completed) {
        await this.logActivity({
          userId,
          action: patch.completed ? "completed" : "uncompleted",
          entityType: "task",
          entityName: current.title,
        });
      } else if (patch.title && patch.title !== current.title) {
        await this.logActivity({
          userId,
          action: "renamed",
          entityType: "task",
          entityName: patch.title,
          detail: `renamed from '${current.title}' to '${patch.title}'`,
        });
      } else if (patch.priority !== undefined && patch.priority !== current.priority) {
        await this.logActivity({
          userId,
          action: "priority_changed",
          entityType: "task",
          entityName: current.title,
          detail: `priority set to ${patch.priority ?? "none"}`,
        });
      } else if (patch.dueDate !== undefined && patch.dueDate !== current.dueDate) {
        await this.logActivity({
          userId,
          action: patch.dueDate ? "due_date_set" : "due_date_cleared",
          entityType: "task",
          entityName: current.title,
          detail: patch.dueDate ? `due date set to ${patch.dueDate}` : "due date cleared",
        });
      } else if (patch.description !== undefined && patch.description !== current.description) {
        await this.logActivity({
          userId,
          action: current.description ? "description_edited" : "description_added",
          entityType: "task",
          entityName: current.title,
        });
      }
    }

    return this.hydrateTask(merged);
  }

  async deleteTask(id: string): Promise<void> {
    const current = this.state.tasks.get(id);
    if (!current) return;
    const time = now();
    const group = this.state.groups.get(current.groupId);
    this.state.tasks.set(id, { ...current, deletedAt: time, updatedAt: time });
    for (const s of Array.from(this.state.subtasks.values())) {
      if (s.taskId === id) {
        this.state.subtasks.set(s.id, { ...s, deletedAt: time, updatedAt: time });
      }
    }
    if (group) {
      await this.logActivity({
        userId: group.userId,
        action: "deleted",
        entityType: "task",
        entityName: current.title,
        detail: "moved to Trash",
      });
    }
  }

  // ===== Subtasks =====
  async createSubtask(params: {
    taskId: string;
    title: string;
    order?: number;
  }): Promise<Subtask> {
    const task = this.state.tasks.get(params.taskId);
    if (!task) throw new Error("Task not found");
    const group = this.state.groups.get(task.groupId);
    const siblings = Array.from(this.state.subtasks.values()).filter(
      (s) => s.taskId === params.taskId && !s.deletedAt,
    );
    const id = uid("sub");
    const sub: Subtask = {
      id,
      taskId: params.taskId,
      title: params.title,
      completed: false,
      order: params.order ?? siblings.length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.state.subtasks.set(id, sub);
    this.state.tasks.set(params.taskId, { ...task, updatedAt: now() });
    if (group) {
      await this.logActivity({
        userId: group.userId,
        action: "created",
        entityType: "subtask",
        entityName: params.title,
        detail: `subtask under '${task.title}'`,
      });
    }
    return sub;
  }

  async getSubtask(id: string): Promise<Subtask | null> {
    return this.state.subtasks.get(id) ?? null;
  }

  async updateSubtask(
    id: string,
    patch: { title?: string; completed?: boolean; order?: number },
  ): Promise<Subtask | null> {
    const current = this.state.subtasks.get(id);
    if (!current) return null;
    const merged: Subtask = { ...current, ...patch, updatedAt: now() };
    this.state.subtasks.set(id, merged);
    const task = this.state.tasks.get(current.taskId);
    if (task) {
      this.state.tasks.set(current.taskId, { ...task, updatedAt: now() });
    }
    return merged;
  }

  async deleteSubtask(id: string): Promise<void> {
    const current = this.state.subtasks.get(id);
    if (!current) return;
    const time = now();
    this.state.subtasks.set(id, { ...current, deletedAt: time, updatedAt: time });
    const task = this.state.tasks.get(current.taskId);
    if (task) {
      this.state.tasks.set(current.taskId, { ...task, updatedAt: now() });
      const group = this.state.groups.get(task.groupId);
      if (group) {
        await this.logActivity({
          userId: group.userId,
          action: "deleted",
          entityType: "subtask",
          entityName: current.title,
          detail: "moved to Trash",
        });
      }
    }
  }

  // ===== Contact =====
  async createContactMessage(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    this.state.contactMessages.push({
      id: uid("msg"),
      ...params,
      createdAt: now(),
    });
  }

  // ===== Trash Operations =====
  async listTrash(userId: string): Promise<TrashData> {
    const userGroups = Array.from(this.state.groups.values()).filter(
      (g) => g.userId === userId,
    );
    const userGroupIds = new Set(userGroups.map((g) => g.id));

    const deletedGroups = userGroups.filter((g) => !!g.deletedAt);

    const deletedTasks: (Task & { groupName?: string })[] = [];
    for (const t of this.state.tasks.values()) {
      if (userGroupIds.has(t.groupId) && t.deletedAt) {
        const parentGroup = this.state.groups.get(t.groupId);
        // Only include if parent group is active (or standalone task deletion)
        deletedTasks.push({
          ...this.hydrateTask(t),
          groupName: parentGroup?.name ?? "Unknown",
        });
      }
    }

    const deletedSubtasks: (Subtask & {
      taskTitle?: string;
      groupName?: string;
    })[] = [];
    for (const s of this.state.subtasks.values()) {
      const parentTask = this.state.tasks.get(s.taskId);
      if (parentTask && userGroupIds.has(parentTask.groupId) && s.deletedAt) {
        const parentGroup = this.state.groups.get(parentTask.groupId);
        deletedSubtasks.push({
          ...s,
          taskTitle: parentTask.title,
          groupName: parentGroup?.name ?? "Unknown",
        });
      }
    }

    return {
      groups: deletedGroups,
      tasks: deletedTasks,
      subtasks: deletedSubtasks,
    };
  }

  async restoreTrashItem(
    userId: string,
    type: "group" | "task" | "subtask",
    id: string,
  ): Promise<boolean> {
    const time = now();
    if (type === "group") {
      const group = this.state.groups.get(id);
      if (!group || group.userId !== userId) return false;
      this.state.groups.set(id, { ...group, deletedAt: null, updatedAt: time });
      // restore child tasks & subtasks
      for (const t of this.state.tasks.values()) {
        if (t.groupId === id) {
          this.state.tasks.set(t.id, { ...t, deletedAt: null, updatedAt: time });
          for (const s of this.state.subtasks.values()) {
            if (s.taskId === t.id) {
              this.state.subtasks.set(s.id, {
                ...s,
                deletedAt: null,
                updatedAt: time,
              });
            }
          }
        }
      }
      await this.logActivity({
        userId,
        action: "restored",
        entityType: "group",
        entityName: group.name,
      });
      return true;
    }

    if (type === "task") {
      const task = this.state.tasks.get(id);
      if (!task) return false;
      const group = this.state.groups.get(task.groupId);
      if (!group || group.userId !== userId) return false;

      // if parent group was deleted, restore group too
      if (group.deletedAt) {
        this.state.groups.set(group.id, {
          ...group,
          deletedAt: null,
          updatedAt: time,
        });
      }
      this.state.tasks.set(id, { ...task, deletedAt: null, updatedAt: time });
      for (const s of this.state.subtasks.values()) {
        if (s.taskId === id) {
          this.state.subtasks.set(s.id, {
            ...s,
            deletedAt: null,
            updatedAt: time,
          });
        }
      }
      await this.logActivity({
        userId,
        action: "restored",
        entityType: "task",
        entityName: task.title,
      });
      return true;
    }

    if (type === "subtask") {
      const sub = this.state.subtasks.get(id);
      if (!sub) return false;
      const task = this.state.tasks.get(sub.taskId);
      if (!task) return false;
      const group = this.state.groups.get(task.groupId);
      if (!group || group.userId !== userId) return false;

      if (group.deletedAt) {
        this.state.groups.set(group.id, {
          ...group,
          deletedAt: null,
          updatedAt: time,
        });
      }
      if (task.deletedAt) {
        this.state.tasks.set(task.id, {
          ...task,
          deletedAt: null,
          updatedAt: time,
        });
      }
      this.state.subtasks.set(id, { ...sub, deletedAt: null, updatedAt: time });
      await this.logActivity({
        userId,
        action: "restored",
        entityType: "subtask",
        entityName: sub.title,
      });
      return true;
    }

    return false;
  }

  async emptyTrash(userId: string): Promise<number> {
    const userGroups = Array.from(this.state.groups.values()).filter(
      (g) => g.userId === userId,
    );
    const groupIds = new Set(userGroups.map((g) => g.id));
    let count = 0;

    for (const g of userGroups) {
      if (g.deletedAt) {
        this.state.groups.delete(g.id);
        count++;
      }
    }
    for (const t of Array.from(this.state.tasks.values())) {
      if (groupIds.has(t.groupId) && t.deletedAt) {
        this.state.tasks.delete(t.id);
        count++;
      }
    }
    for (const s of Array.from(this.state.subtasks.values())) {
      const task = this.state.tasks.get(s.taskId);
      if (task && groupIds.has(task.groupId) && s.deletedAt) {
        this.state.subtasks.delete(s.id);
        count++;
      }
    }
    await this.logActivity({
      userId,
      action: "deleted",
      entityType: "group",
      entityName: "Recycle Bin",
      detail: `permanently emptied ${count} items`,
    });
    return count;
  }

  async deleteTrashItem(
    userId: string,
    type: "group" | "task" | "subtask",
    id: string,
  ): Promise<boolean> {
    if (type === "group") {
      const g = this.state.groups.get(id);
      if (!g || g.userId !== userId) return false;
      this.state.groups.delete(id);
      for (const t of Array.from(this.state.tasks.values())) {
        if (t.groupId === id) {
          this.state.tasks.delete(t.id);
          for (const s of Array.from(this.state.subtasks.values())) {
            if (s.taskId === t.id) this.state.subtasks.delete(s.id);
          }
        }
      }
      return true;
    }
    if (type === "task") {
      const t = this.state.tasks.get(id);
      if (!t) return false;
      const g = this.state.groups.get(t.groupId);
      if (!g || g.userId !== userId) return false;
      this.state.tasks.delete(id);
      for (const s of Array.from(this.state.subtasks.values())) {
        if (s.taskId === id) this.state.subtasks.delete(s.id);
      }
      return true;
    }
    if (type === "subtask") {
      const s = this.state.subtasks.get(id);
      if (!s) return false;
      const t = this.state.tasks.get(s.taskId);
      if (!t) return false;
      const g = this.state.groups.get(t.groupId);
      if (!g || g.userId !== userId) return false;
      this.state.subtasks.delete(id);
      return true;
    }
    return false;
  }

  async autoEmptyTrashOlderThanDays(days = 30): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    let count = 0;

    for (const [id, g] of Array.from(this.state.groups.entries())) {
      if (g.deletedAt && g.deletedAt < cutoff) {
        this.state.groups.delete(id);
        count++;
      }
    }
    for (const [id, t] of Array.from(this.state.tasks.entries())) {
      if (t.deletedAt && t.deletedAt < cutoff) {
        this.state.tasks.delete(id);
        count++;
      }
    }
    for (const [id, s] of Array.from(this.state.subtasks.entries())) {
      if (s.deletedAt && s.deletedAt < cutoff) {
        this.state.subtasks.delete(id);
        count++;
      }
    }
    return count;
  }

  // ===== Export & Import =====
  async exportData(userId: string): Promise<ExportData | null> {
    const userRecord = this.state.users.get(userId);
    if (!userRecord) return null;
    const user = userRecord.user;

    const groups = await this.listGroups(userId);
    const exportedGroups = [];

    for (const g of groups) {
      const tasks = await this.listTasksByGroup(g.id);
      const exportedTasks = tasks.map((t) => ({
        name: t.title,
        description: t.description,
        priority: t.priority ?? "none",
        due_date: t.dueDate ?? null,
        is_completed: t.completed,
        position: t.order,
        subtasks: (t.subtasks || []).map((s) => ({
          name: s.title,
          is_completed: s.completed,
          position: s.order,
        })),
      }));

      exportedGroups.push({
        name: g.name,
        position: g.order,
        tasks: exportedTasks,
      });
    }

    return {
      exported_at: now(),
      user: { name: user.name, email: user.email },
      groups: exportedGroups,
    };
  }

  async importData(
    userId: string,
    data: ExportData,
  ): Promise<{ groupsCount: number; tasksCount: number; subtasksCount: number }> {
    // Delete existing active groups and items for user
    const existingGroups = Array.from(this.state.groups.values()).filter(
      (g) => g.userId === userId,
    );
    for (const g of existingGroups) {
      this.state.groups.delete(g.id);
      for (const t of Array.from(this.state.tasks.values())) {
        if (t.groupId === g.id) {
          this.state.tasks.delete(t.id);
          for (const s of Array.from(this.state.subtasks.values())) {
            if (s.taskId === t.id) this.state.subtasks.delete(s.id);
          }
        }
      }
    }

    let groupsCount = 0;
    let tasksCount = 0;
    let subtasksCount = 0;

    for (let gi = 0; gi < data.groups.length; gi++) {
      const gDef = data.groups[gi];
      const grp = await this.createGroup(userId, gDef.name);
      if (gDef.position !== undefined) {
        await this.updateGroup(grp.id, { order: gDef.position });
      }
      groupsCount++;

      for (let ti = 0; ti < (gDef.tasks || []).length; ti++) {
        const tDef = gDef.tasks[ti];
        const task = await this.createTask({
          groupId: grp.id,
          title: tDef.name,
          description: tDef.description,
          order: tDef.position ?? ti,
          priority: tDef.priority ?? "none",
          dueDate: tDef.due_date ?? null,
        });
        if (tDef.is_completed) {
          await this.updateTask(task.id, { completed: true });
        }
        tasksCount++;

        for (let si = 0; si < (tDef.subtasks || []).length; si++) {
          const sDef = tDef.subtasks[si];
          const sub = await this.createSubtask({
            taskId: task.id,
            title: sDef.name,
            order: sDef.position ?? si,
          });
          if (sDef.is_completed) {
            await this.updateSubtask(sub.id, { completed: true });
          }
          subtasksCount++;
        }
      }
    }

    await this.logActivity({
      userId,
      action: "created",
      entityType: "user",
      entityName: "Backup Import",
      detail: `imported ${groupsCount} groups, ${tasksCount} tasks, ${subtasksCount} subtasks`,
    });

    return { groupsCount, tasksCount, subtasksCount };
  }
}

let db: MemoryDatabase | null = null;

export function getDb(): MemoryDatabase {
  if (!db) {
    db = new MemoryDatabase();
    console.log("[SimplLife DB] Using in-memory database store.");
  }
  return db;
}
