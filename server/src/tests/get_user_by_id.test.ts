
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUserById } from '../handlers/get_user_by_id';

describe('getUserById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when found', async () => {
    // Create test user
    const testUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'Client-User' as const
    };

    await db.insert(usersTable)
      .values(testUser)
      .execute();

    const result = await getUserById('test-user-1');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('test-user-1');
    expect(result!.email).toEqual('test@example.com');
    expect(result!.name).toEqual('Test User');
    expect(result!.role).toEqual('Client-User');
    expect(result!.createdAt).toBeInstanceOf(Date);
    expect(result!.updatedAt).toBeInstanceOf(Date);
  });

  it('should return null when user not found', async () => {
    const result = await getUserById('non-existent-user');

    expect(result).toBeNull();
  });

  it('should return correct user when multiple users exist', async () => {
    // Create multiple test users
    const testUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'Client-User' as const
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
        role: 'Client-Admin' as const
      }
    ];

    await db.insert(usersTable)
      .values(testUsers)
      .execute();

    const result = await getUserById('user-2');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('user-2');
    expect(result!.email).toEqual('user2@example.com');
    expect(result!.name).toEqual('User Two');
    expect(result!.role).toEqual('Client-Admin');
  });
});
