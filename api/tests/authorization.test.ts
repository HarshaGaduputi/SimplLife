import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getDb } from '../db.js';

describe('Authorization Checks', () => {
  let userAToken: string;
  let userBToken: string;
  let userANoteId: string;
  let userBNoteId: string;

  beforeAll(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User A', email: 'usera@example.com', password: 'password123' });
    
    // We can extract token from cookies since it's httpOnly, but the controller might also return it in response headers.
    // Actually, we modified auth.controller.ts to return `{ success: true, user: ... }` and set a cookie.
    // Supertest can grab cookies from the `set-cookie` header.
    const cookiesA = resA.headers['set-cookie'] as unknown as string[];
    userAToken = cookiesA.find((c: string) => c.startsWith('token=')).split(';')[0].split('=')[1];

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: 'userb@example.com', password: 'password123' });
    const cookiesB = resB.headers['set-cookie'] as unknown as string[];
    userBToken = cookiesB.find((c: string) => c.startsWith('token=')).split(';')[0].split('=')[1];
  });

  describe('Notes Authorization', () => {
    it('User A should be able to create a note', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Cookie', [`token=${userAToken}`])
        .send({ title: 'User A Secret Note' });
      
      expect(res.status).toBe(201);
      userANoteId = res.body.note.id;
    });

    it('User B should not be able to get User A\'s note', async () => {
      const res = await request(app)
        .get(`/api/notes/${userANoteId}`)
        .set('Cookie', [`token=${userBToken}`]);
      
      expect(res.status).toBe(404); // returns 404 if not found or unauthorized
    });

    it('User B should not be able to update User A\'s note', async () => {
      const res = await request(app)
        .patch(`/api/notes/${userANoteId}`)
        .set('Cookie', [`token=${userBToken}`])
        .send({ title: 'Hacked Title' });
      
      expect(res.status).toBe(404);
    });

    it('User B should not be able to delete User A\'s note', async () => {
      const res = await request(app)
        .delete(`/api/notes/${userANoteId}`)
        .set('Cookie', [`token=${userBToken}`]);
      
      expect(res.status).toBe(404);
    });
  });

  describe('Goals Authorization', () => {
    let userAGoalId: string;

    it('User A should be able to create a goal', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Cookie', [`token=${userAToken}`])
        .send({ title: 'User A Secret Goal' });
      
      expect(res.status).toBe(201);
      userAGoalId = res.body.goal.id;
    });

    it('User B should not be able to update User A\'s goal', async () => {
      const res = await request(app)
        .patch(`/api/goals/${userAGoalId}`)
        .set('Cookie', [`token=${userBToken}`])
        .send({ title: 'Hacked Goal Title' });
      
      expect(res.status).toBe(404);
    });

    it('User B should not be able to delete User A\'s goal', async () => {
      const res = await request(app)
        .delete(`/api/goals/${userAGoalId}`)
        .set('Cookie', [`token=${userBToken}`]);
      
      expect(res.status).toBe(404);
    });
  });

  describe('Habits Authorization', () => {
    let userAHabitId: string;

    it('User A should be able to create a habit', async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Cookie', [`token=${userAToken}`])
        .send({ title: 'User A Habit', frequency: 'daily' });
      
      expect(res.status).toBe(201);
      userAHabitId = res.body.habit.id;
    });

    it('User B should not be able to toggle User A\'s habit', async () => {
      const res = await request(app)
        .post(`/api/habits/${userAHabitId}/toggle`)
        .set('Cookie', [`token=${userBToken}`])
        .send({ date: '2026-08-10' });
      
      expect(res.status).toBe(404);
    });

    it('User B should not be able to delete User A\'s habit', async () => {
      const res = await request(app)
        .delete(`/api/habits/${userAHabitId}`)
        .set('Cookie', [`token=${userBToken}`]);
      
      expect(res.status).toBe(404);
    });
  });
});
