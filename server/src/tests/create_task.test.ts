
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable, requestsTable, organizationsTable, usersTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task with minimal fields', async () => {
    // Create prerequisite organization
    const orgId = randomUUID();
    await db.insert(organizationsTable)
      .values({
        id: orgId,
        name: 'Test Organization'
      })
      .execute();

    // Create prerequisite request
    const requestId = randomUUID();
    await db.insert(requestsTable)
      .values({
        id: requestId,
        organizationId: orgId,
        title: 'Test Request',
        description: 'A test request'
      })
      .execute();

    const testInput: CreateTaskInput = {
      requestId,
      title: 'Test Task',
      description: 'A task for testing',
      priority: 'Medium'
    };

    const result = await createTask(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Task');
    expect(result.description).toEqual('A task for testing');
    expect(result.requestId).toEqual(requestId);
    expect(result.priority).toEqual('Medium');
    expect(result.status).toEqual('Not Started');
    expect(result.assigneeId).toBeNull();
    expect(result.dueDate).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a task with all fields', async () => {
    // Create prerequisite organization
    const orgId = randomUUID();
    await db.insert(organizationsTable)
      .values({
        id: orgId,
        name: 'Test Organization'
      })
      .execute();

    // Create prerequisite user
    const userId = randomUUID();
    await db.insert(usersTable)
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'Client-User'
      })
      .execute();

    // Create prerequisite request
    const requestId = randomUUID();
    await db.insert(requestsTable)
      .values({
        id: requestId,
        organizationId: orgId,
        title: 'Test Request',
        description: 'A test request'
      })
      .execute();

    const dueDate = new Date('2024-12-31');
    const testInput: CreateTaskInput = {
      requestId,
      title: 'Complete Task',
      description: 'A task with all fields',
      assigneeId: userId,
      priority: 'High',
      dueDate
    };

    const result = await createTask(testInput);

    expect(result.title).toEqual('Complete Task');
    expect(result.description).toEqual('A task with all fields');
    expect(result.requestId).toEqual(requestId);
    expect(result.assigneeId).toEqual(userId);
    expect(result.priority).toEqual('High');
    expect(result.dueDate).toEqual(dueDate);
    expect(result.status).toEqual('Not Started');
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save task to database', async () => {
    // Create prerequisite organization
    const orgId = randomUUID();
    await db.insert(organizationsTable)
      .values({
        id: orgId,
        name: 'Test Organization'
      })
      .execute();

    // Create prerequisite request
    const requestId = randomUUID();
    await db.insert(requestsTable)
      .values({
        id: requestId,
        organizationId: orgId,
        title: 'Test Request',
        description: 'A test request'
      })
      .execute();

    const testInput: CreateTaskInput = {
      requestId,
      title: 'Database Task',
      description: 'A task to verify database storage',
      priority: 'Low'
    };

    const result = await createTask(testInput);

    // Verify task was saved to database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toEqual('Database Task');
    expect(tasks[0].description).toEqual('A task to verify database storage');
    expect(tasks[0].requestId).toEqual(requestId);
    expect(tasks[0].priority).toEqual('Low');
    expect(tasks[0].status).toEqual('Not Started');
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
    expect(tasks[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when request does not exist', async () => {
    const nonExistentRequestId = randomUUID();
    const testInput: CreateTaskInput = {
      requestId: nonExistentRequestId,
      title: 'Invalid Task',
      description: 'This should fail',
      priority: 'Medium'
    };

    await expect(createTask(testInput)).rejects.toThrow(/Request with id .* not found/);
  });

  it('should handle null assigneeId', async () => {
    // Create prerequisite organization
    const orgId = randomUUID();
    await db.insert(organizationsTable)
      .values({
        id: orgId,
        name: 'Test Organization'
      })
      .execute();

    // Create prerequisite request
    const requestId = randomUUID();
    await db.insert(requestsTable)
      .values({
        id: requestId,
        organizationId: orgId,
        title: 'Test Request',
        description: 'A test request'
      })
      .execute();

    const testInput: CreateTaskInput = {
      requestId,
      title: 'Unassigned Task',
      description: 'A task without assignee',
      assigneeId: null,
      priority: 'Medium'
    };

    const result = await createTask(testInput);

    expect(result.assigneeId).toBeNull();
    expect(result.title).toEqual('Unassigned Task');
  });
});
