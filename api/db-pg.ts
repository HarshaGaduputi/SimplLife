import pg from 'pg';
import { config } from './config/index.js';
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
} from "../shared/types.js";

const { Pool } = pg;

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

  // ===== Users =====
  async login(email: string): Promise<{ user: User; passwordHash: string } | null> {
    return null;
  }

  async signup(email: string, passwordHash: string, name: string): Promise<{ user: User }> {
    return { user: {} as unknown as User };
  }

  async getUser(id: string): Promise<{ user: User; passwordHash: string } | null> {
    return null;
  }
  
  async createUser(params: { name: string; email: string; passwordHash: string; }): Promise<User> { return {} as unknown as User; }
  async findUserByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> { return null; }
  async findUserById(id: string): Promise<User | null> { return null; }
  async updateUser(id: string, patch: Partial<User>): Promise<User | null> { return null; }
  async listAllUsers(): Promise<User[]> { return []; }

  // ===== Groups =====
  async listGroups(userId: string): Promise<Group[]> { return []; }
  async getGroup(id: string): Promise<Group | null> { return null; }
  async createGroup(userId: string, name: string, color?: string): Promise<Group> { return {} as unknown as Group; }
  async updateGroup(id: string, patch: { name?: string; color?: string; order?: number }): Promise<Group | null> { return null; }
  async deleteGroup(id: string): Promise<void> {}

  // ===== Tasks =====
  async listAllTasksForUser(userId: string): Promise<Task[]> { return []; }
  async listTasksByGroup(groupId: string): Promise<Task[]> { return []; }
  async getTask(id: string): Promise<Task | null> { return null; }
  async createTask(params: any): Promise<Task> { return {} as unknown as Task; }
  async updateTask(id: string, patch: any): Promise<Task | null> { return null; }
  async deleteTask(id: string): Promise<void> {}

  async getSubtask(id: string): Promise<Subtask | null> { return null; }
  async createSubtask(params: any): Promise<Subtask> { return {} as unknown as Subtask; }
  async updateSubtask(id: string, patch: any): Promise<Subtask | null> { return null; }
  async deleteSubtask(id: string): Promise<void> {}

  // ===== Sync State =====
  async syncState(userId: string, groups: Group[]): Promise<void> {}
  
  // ===== Trash =====
  async listTrash(userId: string): Promise<TrashData> { return { groups: [], tasks: [], subtasks: [] }; }
  async restoreTrashItem(userId: string, type: 'group' | 'task' | 'subtask', id: string): Promise<boolean> { return true; }
  async emptyTrash(userId: string): Promise<number> { return 0; }
  async deleteTrashItem(userId: string, type: 'group' | 'task' | 'subtask', id: string): Promise<boolean> { return true; }
  async autoEmptyTrashOlderThanDays(days: number): Promise<number> { return 0; }
  async clearTrash(userId: string, olderThanDays?: number): Promise<number> { return 0; }

  // ===== Export/Import =====
  async exportData(userId: string): Promise<ExportData | null> { return null; }
  async importData(userId: string, data: ExportData) { return { groupsCount: 0, tasksCount: 0, subtasksCount: 0 }; }

  // ===== Goals =====
  async listGoals(userId: string): Promise<Goal[]> { return []; }
  async getGoal(id: string): Promise<Goal | null> { return null; }
  async createGoal(userId: string, params: any): Promise<Goal> { return {} as unknown as Goal; }
  async updateGoal(userId: string, id: string, patch: any): Promise<Goal | null> { return null; }
  async deleteGoal(userId: string, id: string): Promise<boolean> { return true; }

  // ===== Habits =====
  async listHabits(userId: string): Promise<Habit[]> { return []; }
  async createHabit(userId: string, params: any): Promise<Habit> { return {} as unknown as Habit; }
  async updateHabit(userId: string, id: string, patch: any): Promise<Habit | null> { return null; }
  async toggleHabit(userId: string, id: string, date: string): Promise<Habit | null> { return null; }
  async deleteHabit(userId: string, id: string): Promise<boolean> { return true; }

  // ===== Focus Sessions =====
  async listFocusSessions(userId: string): Promise<FocusSession[]> { return []; }
  async createFocusSession(userId: string, duration: number, taskTitle?: string | null): Promise<FocusSession> { return {} as unknown as FocusSession; }

  // ===== Notes =====
  async listNotes(userId: string): Promise<Note[]> { return []; }
  async getNote(id: string): Promise<Note | null> { return null; }
  async createNote(userId: string, params: any): Promise<Note> { return {} as unknown as Note; }
  async updateNote(userId: string, id: string, patch: any): Promise<Note | null> { return null; }
  async deleteNote(userId: string, id: string): Promise<boolean> { return true; }

  // ===== Journal =====
  async listJournal(userId: string): Promise<JournalEntry[]> { return []; }
  async getJournal(userId: string, date: string): Promise<JournalEntry | null> { return null; }
  async saveJournal(userId: string, date: string, params: any): Promise<JournalEntry> { return {} as unknown as JournalEntry; }

  // ===== Templates =====
  async listTemplates(): Promise<Template[]> { return []; }
  async getTemplate(id: string): Promise<Template | null> { return null; }

  // ===== Activity =====
  async listActivity(userId: string, limit: number, offset?: number): Promise<ActivityLog[]> { return []; }
  async logActivity(params: any): Promise<ActivityLog> { return {} as unknown as ActivityLog; }
  
  // ===== Contact =====
  async createContactMessage(params: any): Promise<void> {}
}
