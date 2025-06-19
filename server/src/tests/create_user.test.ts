
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input data
const testInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'Client-User'
};

const adminInput: CreateUserInput = {
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'System-Admin'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with valid input', async () => {
    const result = await createUser(testInput);

    // Verify basic fields
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.role).toEqual('Client-User');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].name).toEqual('Test User');
    expect(users[0].role).toEqual('Client-User');
    expect(users[0].createdAt).toBeInstanceOf(Date);
    expect(users[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should create users with different roles', async () => {
    const clientUser = await createUser(testInput);
    const adminUser = await createUser(adminInput);

    expect(clientUser.role).toEqual('Client-User');
    expect(adminUser.role).toEqual('System-Admin');

    // Verify both users exist in database
    const users = await db.select().from(usersTable).execute();
    expect(users).toHaveLength(2);
    
    const roles = users.map(user => user.role).sort();
    expect(roles).toEqual(['Client-User', 'System-Admin']);
  });

  it('should reject duplicate email addresses', async () => {
    await createUser(testInput);

    // Attempt to create another user with the same email
    const duplicateInput: CreateUserInput = {
      email: 'test@example.com',
      name: 'Another User',
      role: 'Guest'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('should generate unique IDs for different users', async () => {
    const user1 = await createUser(testInput);
    const user2 = await createUser(adminInput);

    expect(user1.id).toBeDefined();
    expect(user2.id).toBeDefined();
    expect(user1.id).not.toEqual(user2.id);
  });
});
