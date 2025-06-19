
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUsers } from '../handlers/get_users';

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getUsers();
    expect(result).toEqual([]);
  });

  it('should return all users', async () => {
    // Create test users
    const testUsers: CreateUserInput[] = [
      {
        email: 'user1@example.com',
        name: 'User One',
        role: 'Client-User'
      },
      {
        email: 'user2@example.com',
        name: 'User Two',
        role: 'Client-Admin'
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'System-Admin'
      }
    ];

    // Insert test users
    await db.insert(usersTable)
      .values(testUsers.map(user => ({
        id: crypto.randomUUID(),
        ...user
      })))
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(3);
    
    // Verify all users are returned with correct structure
    result.forEach(user => {
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    // Verify specific user data
    const emails = result.map(u => u.email);
    expect(emails).toContain('user1@example.com');
    expect(emails).toContain('user2@example.com');
    expect(emails).toContain('admin@example.com');

    // Verify roles
    const roles = result.map(u => u.role);
    expect(roles).toContain('Client-User');
    expect(roles).toContain('Client-Admin');
    expect(roles).toContain('System-Admin');
  });

  it('should return users in database order', async () => {
    // Create users with specific order
    const user1Id = crypto.randomUUID();
    const user2Id = crypto.randomUUID();

    await db.insert(usersTable)
      .values([
        {
          id: user1Id,
          email: 'first@example.com',
          name: 'First User',
          role: 'Client-User'
        },
        {
          id: user2Id,
          email: 'second@example.com',
          name: 'Second User',
          role: 'Client-Admin'
        }
      ])
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].email).toEqual('first@example.com');
    expect(result[1].email).toEqual('second@example.com');
  });
});
