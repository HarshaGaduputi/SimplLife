import pg from 'pg';
import type {
  ActivityLog,
  ExportData,
  Group,
  PriorityLevel,
  Subtask,
  Task,
  User,
  Goal,
  Habit,
  FocusSession,
  Note,
  JournalEntry,
  Template,
  TrashData,
  CalendarEvent,
} from "../shared/types.js";
import { SEED_TEMPLATES } from "./services/seedTemplates.service.js";

const { Pool } = pg;

type ExportGroupRow = { id: string; name: string; position: number };
type ExportTaskRow = { id: string; title: string; description: string | null; priority: PriorityLevel | null; due_date: Date | string | null; completed: boolean; position: number };
type ExportSubtaskRow = { title: string; completed: boolean; position: number };

function uid(prefix = "id"): string {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export class PostgresDatabase {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.pool.query('SELECT 1').catch(err => {
      console.error('[SimplLife DB] Postgres connection error:', err);
    });
  }

  private async query<T>(text: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(text, params);
    return res.rows;
  }

  private async queryOne<T>(text: string, params: any[] = []): Promise<T | null> {
    const res = await this.pool.query(text, params);
    return res.rows[0] || null;
  }

  // ===== Helpers =====
  private mapUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      digestEmailsEnabled: row.digest_emails_enabled,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    };
  }

  private mapGroup(row: any): Group {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      order: row.position,
      description: row.description,
      coverImage: row.cover_image,
      color: row.color,
      icon: row.icon,
      archived: row.archived,
      favorite: row.favorite,
      deletedAt: row.deleted_at?.toISOString() || null,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  private mapTask(row: any): Task {
    return {
      id: row.id,
      groupId: row.group_id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      completedAt: row.completed_at?.toISOString() || null,
      order: row.position,
      templateId: row.template_id,
      priority: row.priority,
      dueDate: row.due_date?.toISOString() || null,
      goalId: row.goal_id || null,
      dependsOnId: row.depends_on_id || null,
      startDate: row.start_date?.toISOString() || null,
      estimatedDuration: row.estimated_duration,
      actualDuration: row.actual_duration,
      tags: row.tags || [],
      recurring: row.recurring,
      pinned: row.pinned,
      favorite: row.favorite,
      deletedAt: row.deleted_at?.toISOString() || null,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
      subtasks: [], // populated later
    };
  }

  private mapSubtask(row: any): Subtask {
    return {
      id: row.id,
      taskId: row.task_id,
      title: row.title,
      completed: row.completed,
      order: row.position,
      deletedAt: row.deleted_at?.toISOString() || null,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  // ===== Users =====
  async createUser(params: { name: string; email: string; passwordHash: string; }): Promise<User> {
    const id = uid('usr');
    const row = await this.queryOne(`
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, params.name, params.email.toLowerCase(), params.passwordHash]);
    return this.mapUser(row);
  }

  async findUserByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const row = await this.queryOne(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (!row) return null;
    return { user: this.mapUser(row), passwordHash: (row as any).password };
  }

  async findUserById(id: string): Promise<User | null> {
    const row = await this.queryOne(`SELECT * FROM users WHERE id = $1`, [id]);
    if (!row) return null;
    return this.mapUser(row);
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (patch.name !== undefined) { updates.push(`name = $${i++}`); params.push(patch.name); }
    if (patch.digestEmailsEnabled !== undefined) { updates.push(`digest_emails_enabled = $${i++}`); params.push(patch.digestEmailsEnabled); }
    
    if (updates.length === 0) return this.findUserById(id);
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const row = await this.queryOne(`
      UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING *
    `, params);
    
    if (!row) return null;
    return this.mapUser(row);
  }

  async listAllUsers(): Promise<User[]> {
    const rows = await this.query(`SELECT * FROM users ORDER BY created_at DESC`);
    return rows.map(this.mapUser);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const res = await this.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [userId]);
    return res.length > 0;
  }

  // ===== Calendar =====
  private mapCalendarEvent(row: any): CalendarEvent {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      date: new Date(row.event_date).toISOString().split('T')[0],
      startTime: row.start_time,
      endTime: row.end_time,
      type: row.event_type,
      reminderAt: row.reminder_at?.toISOString() || null,
      completed: row.completed,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  async listCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    const rows = await this.query(`SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY event_date ASC`, [userId]);
    return rows.map(this.mapCalendarEvent);
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | null> {
    const row = await this.queryOne(`SELECT * FROM calendar_events WHERE id = $1`, [id]);
    return row ? this.mapCalendarEvent(row) : null;
  }

  async createCalendarEvent(userId: string, params: any): Promise<CalendarEvent> {
    const id = uid('cal');
    const row = await this.queryOne(`
      INSERT INTO calendar_events (id, user_id, title, description, event_date, start_time, end_time, event_type, reminder_at, completed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `, [id, userId, params.title, params.description || null, params.date, params.startTime || null, params.endTime || null, params.type || 'event', params.reminderAt || null, params.completed || false]);
    return this.mapCalendarEvent(row);
  }

  async updateCalendarEvent(userId: string, id: string, patch: any): Promise<CalendarEvent | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (patch.title !== undefined) { updates.push(`title = $${i++}`); params.push(patch.title); }
    if (patch.description !== undefined) { updates.push(`description = $${i++}`); params.push(patch.description); }
    if (patch.date !== undefined) { updates.push(`event_date = $${i++}`); params.push(patch.date); }
    if (patch.startTime !== undefined) { updates.push(`start_time = $${i++}`); params.push(patch.startTime); }
    if (patch.endTime !== undefined) { updates.push(`end_time = $${i++}`); params.push(patch.endTime); }
    if (patch.type !== undefined) { updates.push(`event_type = $${i++}`); params.push(patch.type); }
    if (patch.completed !== undefined) { updates.push(`completed = $${i++}`); params.push(patch.completed); }
    
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      params.push(userId);
      const row = await this.queryOne(`UPDATE calendar_events SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`, params);
      return row ? this.mapCalendarEvent(row) : null;
    }
    return this.getCalendarEvent(id);
  }

  async deleteCalendarEvent(userId: string, id: string): Promise<boolean> {
    const res = await this.query(`DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return res.length > 0;
  }

  // ===== Groups =====
  async listGroups(userId: string): Promise<Group[]> {
    const rows = await this.query(`SELECT * FROM groups WHERE user_id = $1 AND deleted_at IS NULL ORDER BY position ASC, created_at ASC`, [userId]);
    return rows.map(this.mapGroup);
  }

  async getGroup(id: string): Promise<Group | null> {
    const row = await this.queryOne(`SELECT * FROM groups WHERE id = $1`, [id]);
    if (!row) return null;
    return this.mapGroup(row);
  }

  async createGroup(userId: string, name: string, params?: { description?: string; coverImage?: string; color?: string; icon?: string }): Promise<Group> {
    const id = uid('grp');
    const existing = await this.queryOne(`SELECT COUNT(*) as c FROM groups WHERE user_id = $1 AND deleted_at IS NULL`, [userId]);
    const order = parseInt((existing as any)?.c || '0');
    
    const row = await this.queryOne(`
      INSERT INTO groups (id, user_id, name, position, description, cover_image, color, icon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      id, userId, name, order,
      params?.description || null,
      params?.coverImage || null,
      params?.color || null,
      params?.icon || null
    ]);
    
    await this.logActivity({ userId, action: 'created', entityType: 'group', entityName: name });
    return this.mapGroup(row);
  }

  async updateGroup(id: string, patch: { name?: string; order?: number; description?: string | null; coverImage?: string | null; color?: string | null; icon?: string | null; archived?: boolean; favorite?: boolean; }): Promise<Group | null> {
    const current = await this.getGroup(id);
    if (!current) return null;
    
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    
    if (patch.name !== undefined) { updates.push(`name = $${i++}`); params.push(patch.name); }
    if (patch.order !== undefined) { updates.push(`position = $${i++}`); params.push(patch.order); }
    if (patch.description !== undefined) { updates.push(`description = $${i++}`); params.push(patch.description); }
    if (patch.coverImage !== undefined) { updates.push(`cover_image = $${i++}`); params.push(patch.coverImage); }
    if (patch.color !== undefined) { updates.push(`color = $${i++}`); params.push(patch.color); }
    if (patch.icon !== undefined) { updates.push(`icon = $${i++}`); params.push(patch.icon); }
    if (patch.archived !== undefined) { updates.push(`archived = $${i++}`); params.push(patch.archived); }
    if (patch.favorite !== undefined) { updates.push(`favorite = $${i++}`); params.push(patch.favorite); }
    
    if (updates.length === 0) return current;
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const row = await this.queryOne(`
      UPDATE groups SET ${updates.join(', ')} WHERE id = $${i} RETURNING *
    `, params);
    
    if (patch.name && patch.name !== current.name) {
      await this.logActivity({
        userId: current.userId,
        action: 'renamed',
        entityType: 'group',
        entityName: patch.name,
        detail: `renamed from '${current.name}' to '${patch.name}'`
      });
    }
    
    return this.mapGroup(row);
  }

  async deleteGroup(id: string): Promise<void> {
    const current = await this.getGroup(id);
    if (!current) return;
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE groups SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`, [id]);
      await client.query(`UPDATE tasks SET deleted_at = NOW(), updated_at = NOW() WHERE group_id = $1 AND deleted_at IS NULL`, [id]);
      await client.query(`
        UPDATE subtasks SET deleted_at = NOW(), updated_at = NOW() 
        WHERE task_id IN (SELECT id FROM tasks WHERE group_id = $1) AND deleted_at IS NULL
      `, [id]);
      await client.query('COMMIT');
      
      await this.logActivity({
        userId: current.userId,
        action: 'deleted',
        entityType: 'group',
        entityName: current.name,
        detail: 'moved to Trash'
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // ===== Tasks =====
  private async hydrateTask(task: Task): Promise<Task> {
    const subRows = await this.query(`SELECT * FROM subtasks WHERE task_id = $1 AND deleted_at IS NULL ORDER BY position ASC, created_at ASC`, [task.id]);
    task.subtasks = subRows.map(this.mapSubtask);
    return task;
  }

  async listTasksByGroup(groupId: string): Promise<Task[]> {
    const rows = await this.query(`SELECT * FROM tasks WHERE group_id = $1 AND deleted_at IS NULL ORDER BY position ASC, created_at ASC`, [groupId]);
    const tasks = rows.map(this.mapTask);
    for (const t of tasks) { await this.hydrateTask(t); }
    return tasks;
  }

  async listAllTasksForUser(userId: string): Promise<Task[]> {
    const rows = await this.query(`
      SELECT t.* FROM tasks t
      JOIN groups g ON t.group_id = g.id
      WHERE t.user_id = $1 AND t.deleted_at IS NULL AND g.deleted_at IS NULL
      ORDER BY t.position ASC, t.created_at ASC
    `, [userId]);
    const tasks = rows.map(this.mapTask);
    for (const t of tasks) { await this.hydrateTask(t); }
    return tasks;
  }

  async getTask(id: string): Promise<Task | null> {
    const row = await this.queryOne(`SELECT * FROM tasks WHERE id = $1`, [id]);
    if (!row) return null;
    const task = this.mapTask(row);
    return await this.hydrateTask(task);
  }

  async createTask(params: {
    groupId: string;
    title: string;
    description?: string | null;
    order?: number;
    templateId?: string | null;
    priority?: PriorityLevel | null;
    dueDate?: string | null;
    startDate?: string | null;
    estimatedDuration?: number | null;
    actualDuration?: number | null;
    tags?: string[];
    recurring?: "daily" | "weekly" | "monthly" | null;
    pinned?: boolean;
    favorite?: boolean;
    goalId?: string | null;
    dependsOnId?: string | null;
  }): Promise<Task> {
    const group = await this.getGroup(params.groupId);
    if (!group) throw new Error("Group not found");
    
    const id = uid('tsk');
    let order = params.order;
    if (order === undefined) {
      const existing = await this.queryOne(`SELECT COUNT(*) as c FROM tasks WHERE group_id = $1 AND deleted_at IS NULL`, [params.groupId]);
      order = parseInt((existing as any)?.c || '0');
    }

    const row = await this.queryOne(`
      INSERT INTO tasks (
        id, group_id, user_id, title, description, position, template_id, priority,
        due_date, start_date, estimated_duration, actual_duration, tags, recurring,
        pinned, favorite, goal_id, depends_on_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      id, params.groupId, group.userId, params.title, params.description || null,
      order, params.templateId || null, params.priority || 'none',
      params.dueDate || null, params.startDate || null, params.estimatedDuration || null,
      params.actualDuration || null, params.tags || '{}', params.recurring || null,
      params.pinned || false, params.favorite || false, params.goalId || null, params.dependsOnId || null
    ]);

    await this.logActivity({
      userId: group.userId,
      action: 'created',
      entityType: 'task',
      entityName: params.title,
      detail: `added to group '${group.name}'`
    });
    
    return await this.hydrateTask(this.mapTask(row));
  }

  async updateTask(id: string, patch: any): Promise<Task | null> {
    const current = await this.getTask(id);
    if (!current) return null;
    
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    
    if (patch.title !== undefined) { updates.push(`title = $${i++}`); params.push(patch.title); }
    if (patch.description !== undefined) { updates.push(`description = $${i++}`); params.push(patch.description); }
    if (patch.completed !== undefined) { 
      updates.push(`completed = $${i++}`); params.push(patch.completed); 
      updates.push(`completed_at = $${i++}`); params.push(patch.completed ? new Date().toISOString() : null);
    }
    if (patch.order !== undefined) { updates.push(`position = $${i++}`); params.push(patch.order); }
    if (patch.templateId !== undefined) { updates.push(`template_id = $${i++}`); params.push(patch.templateId); }
    if (patch.priority !== undefined) { updates.push(`priority = $${i++}`); params.push(patch.priority); }
    if (patch.dueDate !== undefined) { updates.push(`due_date = $${i++}`); params.push(patch.dueDate); }
    if (patch.goalId !== undefined) { updates.push(`goal_id = $${i++}`); params.push(patch.goalId); }
    if (patch.dependsOnId !== undefined) { updates.push(`depends_on_id = $${i++}`); params.push(patch.dependsOnId); }
    if (patch.startDate !== undefined) { updates.push(`start_date = $${i++}`); params.push(patch.startDate); }
    if (patch.estimatedDuration !== undefined) { updates.push(`estimated_duration = $${i++}`); params.push(patch.estimatedDuration); }
    if (patch.actualDuration !== undefined) { updates.push(`actual_duration = $${i++}`); params.push(patch.actualDuration); }
    if (patch.tags !== undefined) { updates.push(`tags = $${i++}`); params.push(patch.tags); }
    if (patch.recurring !== undefined) { updates.push(`recurring = $${i++}`); params.push(patch.recurring); }
    if (patch.pinned !== undefined) { updates.push(`pinned = $${i++}`); params.push(patch.pinned); }
    if (patch.favorite !== undefined) { updates.push(`favorite = $${i++}`); params.push(patch.favorite); }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      
      await this.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i}`, params);
      
      const group = await this.getGroup(current.groupId);
      const userId = group?.userId;
      
      if (userId) {
        if (patch.completed !== undefined && patch.completed !== current.completed) {
          await this.logActivity({ userId, action: patch.completed ? 'completed' : 'uncompleted', entityType: 'task', entityName: current.title });
        } else if (patch.title && patch.title !== current.title) {
          await this.logActivity({ userId, action: 'renamed', entityType: 'task', entityName: patch.title, detail: `renamed to '${patch.title}'` });
        }
      }
    }
    
    return await this.getTask(id);
  }

  async deleteTask(id: string): Promise<void> {
    const current = await this.getTask(id);
    if (!current) return;
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE tasks SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`, [id]);
      await client.query(`UPDATE subtasks SET deleted_at = NOW(), updated_at = NOW() WHERE task_id = $1 AND deleted_at IS NULL`, [id]);
      await client.query('COMMIT');
      
      const group = await this.getGroup(current.groupId);
      if (group) {
        await this.logActivity({
          userId: group.userId,
          action: 'deleted',
          entityType: 'task',
          entityName: current.title,
          detail: 'moved to Trash'
        });
      }
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // ===== Subtasks =====
  async getSubtask(id: string): Promise<Subtask | null> {
    const row = await this.queryOne(`SELECT * FROM subtasks WHERE id = $1`, [id]);
    return row ? this.mapSubtask(row) : null;
  }

  async createSubtask(params: { taskId: string; title: string; order?: number; }): Promise<Subtask> {
    const task = await this.getTask(params.taskId);
    if (!task) throw new Error("Task not found");
    
    let order = params.order;
    if (order === undefined) {
      const existing = await this.queryOne(`SELECT COUNT(*) as c FROM subtasks WHERE task_id = $1 AND deleted_at IS NULL`, [params.taskId]);
      order = parseInt((existing as any)?.c || '0');
    }
    
    const id = uid('sub');
    const row = await this.queryOne(`
      INSERT INTO subtasks (id, task_id, title, position)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [id, params.taskId, params.title, order]);
    
    await this.query(`UPDATE tasks SET updated_at = NOW() WHERE id = $1`, [params.taskId]);
    return this.mapSubtask(row);
  }

  async updateSubtask(id: string, patch: { title?: string; completed?: boolean; order?: number }): Promise<Subtask | null> {
    const current = await this.getSubtask(id);
    if (!current) return null;
    
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    
    if (patch.title !== undefined) { updates.push(`title = $${i++}`); params.push(patch.title); }
    if (patch.completed !== undefined) { updates.push(`completed = $${i++}`); params.push(patch.completed); }
    if (patch.order !== undefined) { updates.push(`position = $${i++}`); params.push(patch.order); }
    
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      await this.query(`UPDATE subtasks SET ${updates.join(', ')} WHERE id = $${i}`, params);
      await this.query(`UPDATE tasks SET updated_at = NOW() WHERE id = $1`, [current.taskId]);
    }
    
    return await this.getSubtask(id);
  }

  async deleteSubtask(id: string): Promise<void> {
    const current = await this.getSubtask(id);
    if (!current) return;
    await this.query(`UPDATE subtasks SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`, [id]);
    await this.query(`UPDATE tasks SET updated_at = NOW() WHERE id = $1`, [current.taskId]);
  }

  // ===== Sync State =====
  async syncState(_userId: string, _groups: Group[]): Promise<void> {
    // We shouldn't blindly sync state for production, but to satisfy the interface for now:
    console.warn('[SimplLife DB] Full state sync is not recommended. Make specific API mutations instead.');
  }
  
  // ===== Trash =====
  async listTrash(userId: string): Promise<TrashData> {
    const groups = await this.query(`SELECT * FROM groups WHERE user_id = $1 AND deleted_at IS NOT NULL`, [userId]);
    const tasks = await this.query(`
      SELECT t.*, g.name as group_name FROM tasks t 
      JOIN groups g ON t.group_id = g.id
      WHERE t.user_id = $1 AND t.deleted_at IS NOT NULL AND g.deleted_at IS NULL
    `, [userId]);
    const subtasks = await this.query(`
      SELECT s.*, t.title as task_title, g.name as group_name FROM subtasks s
      JOIN tasks t ON s.task_id = t.id
      JOIN groups g ON t.group_id = g.id
      WHERE g.user_id = $1 AND s.deleted_at IS NOT NULL AND t.deleted_at IS NULL AND g.deleted_at IS NULL
    `, [userId]);
    
    return {
      groups: groups.map(this.mapGroup),
      tasks: tasks.map(r => ({ ...this.mapTask(r), groupName: (r as any).group_name })),
      subtasks: subtasks.map(r => ({ ...this.mapSubtask(r), taskTitle: (r as any).task_title, groupName: (r as any).group_name }))
    };
  }

  async restoreTrashItem(userId: string, type: 'group' | 'task' | 'subtask', id: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      let ownerQuery: string;
      if (type === 'group') ownerQuery = 'SELECT id FROM groups WHERE id = $1 AND user_id = $2';
      else if (type === 'task') ownerQuery = 'SELECT id, group_id FROM tasks WHERE id = $1 AND user_id = $2';
      else ownerQuery = 'SELECT s.id, s.task_id, t.group_id FROM subtasks s JOIN tasks t ON t.id = s.task_id WHERE s.id = $1 AND t.user_id = $2';
      const owned = await client.query(ownerQuery, [id, userId]);
      if (owned.rowCount === 0) { await client.query('ROLLBACK'); return false; }

      if (type === 'group') {
        await client.query('UPDATE groups SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2', [id, userId]);
        await client.query('UPDATE tasks SET deleted_at = NULL, updated_at = NOW() WHERE group_id = $1 AND user_id = $2', [id, userId]);
        await client.query('UPDATE subtasks SET deleted_at = NULL, updated_at = NOW() WHERE task_id IN (SELECT id FROM tasks WHERE group_id = $1 AND user_id = $2)', [id, userId]);
      } else if (type === 'task') {
        const task = owned.rows[0];
        await client.query('UPDATE tasks SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2', [id, userId]);
        await client.query('UPDATE subtasks SET deleted_at = NULL, updated_at = NOW() WHERE task_id = $1', [id]);
        await client.query('UPDATE groups SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2', [task.group_id, userId]);
      } else {
        const subtask = owned.rows[0];
        await client.query('UPDATE subtasks SET deleted_at = NULL, updated_at = NOW() WHERE id = $1', [id]);
        await client.query('UPDATE tasks SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2', [subtask.task_id, userId]);
        await client.query('UPDATE groups SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2', [subtask.group_id, userId]);
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async emptyTrash(userId: string): Promise<number> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const subtasks = await client.query(`DELETE FROM subtasks WHERE deleted_at IS NOT NULL AND task_id IN (SELECT id FROM tasks WHERE user_id = $1 AND deleted_at IS NOT NULL) RETURNING id`, [userId]);
      const tasks = await client.query(`DELETE FROM tasks WHERE user_id = $1 AND deleted_at IS NOT NULL RETURNING id`, [userId]);
      const groups = await client.query(`DELETE FROM groups WHERE user_id = $1 AND deleted_at IS NOT NULL RETURNING id`, [userId]);
      await client.query('COMMIT');
      return (subtasks.rowCount ?? 0) + (tasks.rowCount ?? 0) + (groups.rowCount ?? 0);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async deleteTrashItem(userId: string, type: 'group' | 'task' | 'subtask', id: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      let res;
      if (type === 'group') {
        res = await client.query('DELETE FROM groups WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL RETURNING id', [id, userId]);
      } else if (type === 'task') {
        res = await client.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL RETURNING id', [id, userId]);
      } else {
        res = await client.query('DELETE FROM subtasks WHERE id = $1 AND deleted_at IS NOT NULL AND task_id IN (SELECT id FROM tasks WHERE user_id = $2) RETURNING id', [id, userId]);
      }
      await client.query('COMMIT');
      return (res.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async autoEmptyTrashOlderThanDays(days = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const dateStr = cutoff.toISOString();

    let count = 0;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const st = await client.query(`DELETE FROM subtasks WHERE deleted_at < $1`, [dateStr]);
      count += st.rowCount || 0;
      
      const t = await client.query(`DELETE FROM tasks WHERE deleted_at < $1`, [dateStr]);
      count += t.rowCount || 0;
      
      const g = await client.query(`DELETE FROM groups WHERE deleted_at < $1`, [dateStr]);
      count += g.rowCount || 0;

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    
    return count;
  }

  // ===== Export/Import =====
  async exportData(userId: string): Promise<ExportData | null> {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const groups = await this.query<ExportGroupRow>(`SELECT * FROM groups WHERE user_id = $1 AND deleted_at IS NULL ORDER BY position, created_at`, [userId]);
    const exportedGroups = [];
    for (const group of groups) {
      const tasks = await this.query<ExportTaskRow>(`SELECT * FROM tasks WHERE group_id = $1 AND deleted_at IS NULL ORDER BY position, created_at`, [group.id]);
      const exportedTasks = [];
      for (const task of tasks) {
        const subtasks = await this.query<ExportSubtaskRow>(`SELECT * FROM subtasks WHERE task_id = $1 AND deleted_at IS NULL ORDER BY position, created_at`, [task.id]);
        const dueDate = task.due_date instanceof Date ? task.due_date.toISOString() : task.due_date;
        exportedTasks.push({ name: task.title, description: task.description, priority: task.priority ?? 'none', due_date: dueDate, is_completed: task.completed, position: task.position, subtasks: subtasks.map((subtask) => ({ name: subtask.title, is_completed: subtask.completed, position: subtask.position })) });
      }
      exportedGroups.push({ name: group.name, position: group.position, tasks: exportedTasks });
    }
    return { exported_at: new Date().toISOString(), user: { name: user.name, email: user.email }, groups: exportedGroups };
  }
  
  async importData(userId: string, data: ExportData): Promise<{ groupsCount: number; tasksCount: number; subtasksCount: number }> {
    const client = await this.pool.connect();
    let groupsCount = 0, tasksCount = 0, subtasksCount = 0;
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM groups WHERE user_id = $1', [userId]);
      for (const groupDef of data.groups ?? []) {
        const groupId = uid('grp');
        await client.query('INSERT INTO groups (id, user_id, name, position) VALUES ($1, $2, $3, $4)', [groupId, userId, groupDef.name, groupDef.position ?? groupsCount]);
        groupsCount++;
        for (const taskDef of groupDef.tasks ?? []) {
          const taskId = uid('tsk');
          await client.query('INSERT INTO tasks (id, group_id, user_id, title, description, position, priority, due_date, completed, completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [taskId, groupId, userId, taskDef.name, taskDef.description ?? null, taskDef.position ?? tasksCount, taskDef.priority ?? 'none', taskDef.due_date ?? null, taskDef.is_completed ?? false, taskDef.is_completed ? new Date().toISOString() : null]);
          tasksCount++;
          for (const subtaskDef of taskDef.subtasks ?? []) {
            await client.query('INSERT INTO subtasks (id, task_id, title, position, completed) VALUES ($1,$2,$3,$4,$5)', [uid('sub'), taskId, subtaskDef.name, subtaskDef.position ?? subtasksCount, subtaskDef.is_completed ?? false]);
            subtasksCount++;
          }
        }
      }
      await client.query('COMMIT');
      return { groupsCount, tasksCount, subtasksCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  // ===== Goals =====
  private mapGoal(row: any): Goal {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      targetDate: row.target_date ? new Date(row.target_date).toISOString().split('T')[0] : null,
      completed: row.completed,
      category: row.category,
      progress: row.progress || 0,
      milestones: row.milestones ?? [],
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  private async hydrateGoal(goal: Goal): Promise<Goal> {
    const rows = await this.query(`SELECT id, title, completed FROM goal_milestones WHERE goal_id = $1 ORDER BY position ASC`, [goal.id]);
    goal.milestones = rows.map((row: any) => ({ id: row.id, title: row.title, completed: row.completed }));
    return goal;
  }

  async listGoals(userId: string): Promise<Goal[]> {
    const rows = await this.query(`SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at ASC`, [userId]);
    const goals = rows.map(this.mapGoal);
    for (const goal of goals) await this.hydrateGoal(goal);
    return goals;
  }

  async getGoal(id: string): Promise<Goal | null> {
    const row = await this.queryOne(`SELECT * FROM goals WHERE id = $1`, [id]);
    return row ? this.hydrateGoal(this.mapGoal(row)) : null;
  }

  async createGoal(userId: string, params: any): Promise<Goal> {
    const id = uid('gol');
    const row = await this.queryOne(`
      INSERT INTO goals (id, user_id, title, description, category, target_date, completed, progress, emoji)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [id, userId, params.title, params.description, params.category, params.targetDate, params.completed || false, params.progress || 0, params.emoji]);
    for (const [position, title] of (params.milestones ?? []).entries()) {
      await this.query(`INSERT INTO goal_milestones (id, goal_id, title, position) VALUES ($1, $2, $3, $4)`, [uid('mil'), id, title, position]);
    }
    return this.hydrateGoal(this.mapGoal(row));
  }

  async updateGoal(userId: string, id: string, patch: any): Promise<Goal | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (patch.title !== undefined) { updates.push(`title = $${i++}`); params.push(patch.title); }
    if (patch.description !== undefined) { updates.push(`description = $${i++}`); params.push(patch.description); }
    if (patch.completed !== undefined) { updates.push(`completed = $${i++}`); params.push(patch.completed); }
    if (patch.category !== undefined) { updates.push(`category = $${i++}`); params.push(patch.category); }
    if (patch.progress !== undefined) { updates.push(`progress = $${i++}`); params.push(patch.progress); }
    if (patch.targetDate !== undefined) { updates.push(`target_date = $${i++}`); params.push(patch.targetDate); }
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      params.push(userId);
      const row = await this.queryOne(`UPDATE goals SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`, params);
      if (!row) return null;
      if (patch.milestones !== undefined) {
        await this.query(`DELETE FROM goal_milestones WHERE goal_id = $1`, [id]);
        for (const [position, milestone] of patch.milestones.entries()) {
          await this.query(`INSERT INTO goal_milestones (id, goal_id, title, completed, position) VALUES ($1, $2, $3, $4, $5)`, [milestone.id || uid('mil'), id, milestone.title, milestone.completed, position]);
        }
      }
      return this.hydrateGoal(this.mapGoal(row));
    }
    return this.getGoal(id);
  }

  async deleteGoal(userId: string, id: string): Promise<boolean> {
    const res = await this.query(`DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return res.length > 0;
  }

  // ===== Habits =====
  private mapHabit(row: any): Habit {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      frequency: row.frequency,
      history: {},
      streak: row.streak || 0,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  async listHabits(userId: string): Promise<Habit[]> {
    const habits = await this.query(`SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at ASC`, [userId]);
    const res = habits.map(this.mapHabit);
    const logs = await this.query(`
      SELECT habit_id, log_date FROM habit_logs 
      WHERE habit_id IN (SELECT id FROM habits WHERE user_id = $1)
    `, [userId]);
    for (const h of res) {
      for (const log of logs) {
        if ((log as any).habit_id === h.id) {
          h.history[new Date((log as any).log_date).toISOString().split('T')[0]] = true;
        }
      }
    }
    return res;
  }

  async createHabit(userId: string, params: any): Promise<Habit> {
    const id = uid('hbt');
    const row = await this.queryOne(`
      INSERT INTO habits (id, user_id, title, frequency, streak)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [id, userId, params.title, params.frequency, params.streak || 0]);
    return this.mapHabit(row);
  }

  async updateHabit(userId: string, id: string, patch: any): Promise<Habit | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (patch.title !== undefined) { updates.push(`title = $${i++}`); params.push(patch.title); }
    if (patch.frequency !== undefined) { updates.push(`frequency = $${i++}`); params.push(patch.frequency); }
    if (patch.streak !== undefined) { updates.push(`streak = $${i++}`); params.push(patch.streak); }
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      params.push(userId);
      const row = await this.queryOne(`UPDATE habits SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`, params);
      return row ? this.mapHabit(row) : null;
    }
    const row = await this.queryOne(`SELECT * FROM habits WHERE id = $1 AND user_id = $2`, [id, userId]);
    return row ? this.mapHabit(row) : null;
  }

  async toggleHabit(userId: string, id: string, date: string): Promise<Habit | null> {
    const habit = await this.queryOne(`SELECT id FROM habits WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (!habit) return null;
    const existing = await this.queryOne(`SELECT id FROM habit_logs WHERE habit_id = $1 AND log_date = $2`, [id, date]);
    if (existing) {
      await this.query(`DELETE FROM habit_logs WHERE habit_id = $1 AND log_date = $2`, [id, date]);
    } else {
      await this.query(`INSERT INTO habit_logs (id, habit_id, log_date) VALUES ($1, $2, $3)`, [uid('hbl'), id, date]);
    }
    const updated = (await this.listHabits(userId)).find(h => h.id === id) || null;
    if (updated) await this.query(`UPDATE habits SET streak = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`, [updated.streak, id, userId]);
    return updated;
  }

  async deleteHabit(userId: string, id: string): Promise<boolean> {
    const res = await this.query(`DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return res.length > 0;
  }

  // ===== Focus Sessions =====
  async listFocusSessions(userId: string): Promise<FocusSession[]> {
    const rows = await this.query(`SELECT * FROM focus_sessions WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return rows.map(r => ({
      id: (r as any).id,
      userId: (r as any).user_id,
      duration: (r as any).duration,
      taskId: (r as any).task_id,
      taskTitle: (r as any).task_title,
      createdAt: (r as any).created_at.toISOString(),
    }));
  }

  async createFocusSession(userId: string, duration: number, taskId?: string | null, taskTitle?: string | null): Promise<FocusSession> {
    if (taskId) {
      const ownedTask = await this.queryOne(`SELECT id FROM tasks WHERE id = $1 AND user_id = $2`, [taskId, userId]);
      if (!ownedTask) taskId = null;
    }
    const id = uid('foc');
    const row = await this.queryOne(`
      INSERT INTO focus_sessions (id, user_id, duration, task_id, task_title)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [id, userId, duration, taskId || null, taskTitle || null]);
    return {
      id: (row as any).id,
      userId: (row as any).user_id,
      duration: (row as any).duration,
      taskId: (row as any).task_id,
      taskTitle: (row as any).task_title,
      createdAt: (row as any).created_at.toISOString(),
    };
  }

  // ===== Notes =====
  private mapNote(row: any): Note {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      tags: row.tags || [],
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  async listNotes(userId: string): Promise<Note[]> {
    const rows = await this.query(`SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC`, [userId]);
    return rows.map(this.mapNote);
  }

  async getNote(id: string): Promise<Note | null> {
    const row = await this.queryOne(`SELECT * FROM notes WHERE id = $1`, [id]);
    return row ? this.mapNote(row) : null;
  }

  async createNote(userId: string, params: any): Promise<Note> {
    const id = uid('not');
    const row = await this.queryOne(`
      INSERT INTO notes (id, user_id, title, content, tags)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [id, userId, params.title || 'Untitled', params.content || '', params.tags || '{}']);
    return this.mapNote(row);
  }

  async updateNote(userId: string, id: string, patch: any): Promise<Note | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (patch.title !== undefined) { updates.push(`title = $${i++}`); params.push(patch.title); }
    if (patch.content !== undefined) { updates.push(`content = $${i++}`); params.push(patch.content); }
    if (patch.tags !== undefined) { updates.push(`tags = $${i++}`); params.push(patch.tags); }
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      params.push(userId);
      const row = await this.queryOne(`UPDATE notes SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`, params);
      return row ? this.mapNote(row) : null;
    }
    return this.getNote(id);
  }

  async deleteNote(userId: string, id: string): Promise<boolean> {
    const res = await this.query(`DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return res.length > 0;
  }

  // ===== Journal =====
  async listJournal(userId: string): Promise<JournalEntry[]> {
    const rows = await this.query(`SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY entry_date DESC`, [userId]);
    return rows.map(r => ({
      id: (r as any).id,
      userId: (r as any).user_id,
      date: new Date((r as any).entry_date).toISOString().split('T')[0],
      mood: (r as any).mood,
      gratitude: (r as any).gratitude,
      reflection: (r as any).reflection,
      createdAt: (r as any).created_at.toISOString(),
      updatedAt: (r as any).updated_at.toISOString(),
    }));
  }

  async getJournal(userId: string, date: string): Promise<JournalEntry | null> {
    const row = await this.queryOne(`SELECT * FROM journal_entries WHERE user_id = $1 AND entry_date = $2`, [userId, date]);
    if (!row) return null;
    return {
      id: (row as any).id,
      userId: (row as any).user_id,
      date: new Date((row as any).entry_date).toISOString().split('T')[0],
      mood: (row as any).mood,
      gratitude: (row as any).gratitude,
      reflection: (row as any).reflection,
      createdAt: (row as any).created_at.toISOString(),
      updatedAt: (row as any).updated_at.toISOString(),
    };
  }

  async saveJournal(userId: string, date: string, params: any): Promise<JournalEntry> {
    const existing = await this.getJournal(userId, date);
    if (existing) {
      const row = await this.queryOne(`
        UPDATE journal_entries SET mood = $1, gratitude = $2, reflection = $3, updated_at = NOW()
        WHERE id = $4 RETURNING *
      `, [params.mood || existing.mood, params.gratitude || existing.gratitude, params.reflection || existing.reflection, existing.id]);
      return {
        id: (row as any).id,
        userId: (row as any).user_id,
        date: new Date((row as any).entry_date).toISOString().split('T')[0],
        mood: (row as any).mood,
        gratitude: (row as any).gratitude,
        reflection: (row as any).reflection,
        createdAt: (row as any).created_at.toISOString(),
        updatedAt: (row as any).updated_at.toISOString(),
      };
    } else {
      const id = uid('jrn');
      const row = await this.queryOne(`
        INSERT INTO journal_entries (id, user_id, entry_date, mood, gratitude, reflection)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `, [id, userId, date, params.mood || 'good', params.gratitude || '', params.reflection || '']);
      return {
        id: (row as any).id,
        userId: (row as any).user_id,
        date: new Date((row as any).entry_date).toISOString().split('T')[0],
        mood: (row as any).mood,
        gratitude: (row as any).gratitude,
        reflection: (row as any).reflection,
        createdAt: (row as any).created_at.toISOString(),
        updatedAt: (row as any).updated_at.toISOString(),
      };
    }
  }

  // ===== Templates =====
  async listTemplates(): Promise<Template[]> {
    return SEED_TEMPLATES.map((template) => ({ ...template, subtasks: template.subtasks.map((subtask) => ({ ...subtask })) }));
  }
  async getTemplate(id: string): Promise<Template | null> {
    const template = SEED_TEMPLATES.find((item) => item.id === id);
    return template ? { ...template, subtasks: template.subtasks.map((subtask) => ({ ...subtask })) } : null;
  }

  // ===== Activity =====
  async listActivity(userId: string, limit: number, offset: number = 0): Promise<ActivityLog[]> {
    const rows = await this.query(`SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [userId, limit, offset]);
    return rows.map(r => ({
      id: (r as any).id,
      userId: (r as any).user_id,
      action: (r as any).action,
      entityType: (r as any).entity_type,
      entityName: (r as any).entity_name,
      detail: (r as any).detail,
      createdAt: (r as any).created_at.toISOString(),
    }));
  }

  async logActivity(params: { userId: string; action: string; entityType: string; entityName: string; detail?: string }): Promise<ActivityLog> {
    const id = uid('log');
    const row = await this.queryOne(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_name, detail)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id, params.userId, params.action, params.entityType, params.entityName, params.detail || null]);
    return {
      id: (row as any).id,
      userId: (row as any).user_id,
      action: (row as any).action,
      entityType: (row as any).entity_type,
      entityName: (row as any).entity_name,
      detail: (row as any).detail,
      createdAt: (row as any).created_at.toISOString(),
    };
  }
  
  // ===== Contact =====
  async createContactMessage(params: { name: string; email: string; subject: string; message: string }): Promise<void> {
    await this.query(`INSERT INTO contact_messages (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)`, [uid('msg'), params.name, params.email, params.subject, params.message]);
  }

  // ===== Analytics =====
  async getAnalytics(userId: string): Promise<any> {
    // Fetch stats in efficient queries instead of fetching all entities
    const [tasksStats, focusStats, goalsStats, habitsStats, completedTasksHistory] = await Promise.all([
      // Tasks completion
      this.queryOne(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed
        FROM tasks WHERE user_id = $1 AND deleted_at IS NULL
      `, [userId]),
      // Focus sessions total duration
      this.queryOne(`
        SELECT SUM(duration) as total_duration
        FROM focus_sessions WHERE user_id = $1
      `, [userId]),
      // Goals completion
      this.queryOne(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed
        FROM goals WHERE user_id = $1
      `, [userId]),
      // Habits stats
      this.queryOne(`
        SELECT 
          COUNT(*) as active_count,
          MAX(streak) as best_streak
        FROM habits WHERE user_id = $1
      `, [userId]),
      // Last 28 days tasks completion for heatmap and weekly bar chart
      this.query(`
        SELECT DATE(COALESCE(completed_at, updated_at)) as date_val, COUNT(*) as count
        FROM tasks
        WHERE user_id = $1 AND completed = TRUE AND deleted_at IS NULL
        GROUP BY date_val
        ORDER BY date_val DESC
        LIMIT 60
      `, [userId])
    ]);

    const completedTasksCountByDate: Record<string, number> = {};
    for (const row of completedTasksHistory) {
      if ((row as any).date_val) {
        // formatting as YYYY-MM-DD
        const dateObj = new Date((row as any).date_val);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        completedTasksCountByDate[`${yyyy}-${mm}-${dd}`] = parseInt((row as any).count, 10);
      }
    }

    const tStats = tasksStats as any;
    const fStats = focusStats as any;
    const gStats = goalsStats as any;
    const hStats = habitsStats as any;

    const completedTasks = parseInt(tStats?.completed || '0', 10);
    const totalTasks = parseInt(tStats?.total || '0', 10);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      completedTasks,
      completionRate,
      totalFocusMinutes: parseInt(fStats?.total_duration || '0', 10),
      completedGoals: parseInt(gStats?.completed || '0', 10),
      totalGoals: parseInt(gStats?.total || '0', 10),
      activeHabitsCount: parseInt(hStats?.active_count || '0', 10),
      bestStreak: parseInt(hStats?.best_streak || '0', 10),
      completedTasksCountByDate,
    };
  }
}
