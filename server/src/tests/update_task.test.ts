
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable, requestsTable, organizationsTable, usersTable } from '../db/schema';
import { type UpdateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

// Test data setup
const testOrganization = {
  id: 'org-1',
  name: 'Test Organization'
};

const testRequest = {
  id: 'req-1',
  organizationId: 'org-1',
  title: 'Test Request',
  description: 'A request for testing'
};

const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'Client-User' as const
};

const testTask = {
  id: 'task-1',
  requestId: 'req-1',
  title: 'Original Task',
  description: 'Original description',
  status: 'Not Started' as const,
  assigneeId: null,
  priority: 'Medium' as const,
  dueDate: null
};

describe('updateTask', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite data
    await db.insert(organizationsTable).values(testOrganization).execute();
    await db.insert(requestsTable).values(testRequest).execute();
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(tasksTable).values(testTask).execute();
  });
  
  afterEach(resetDB);

  it('should update task title', async () => {
    const input: UpdateTaskInput = {
      id: 'task-1',
      title: 'Updated Task Title'
    };

    const result = await updateTask(input);

    expect(result.id).toEqual('task-1');
    expect(result.title).toEqual('Updated Task Title');
    expect(result.description).toEqual('Original description'); // Unchanged
    expect(result.status).toEqual('Not Started'); // Unchanged
    expect(result.priority).toEqual('Medium'); // Unchanged
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update task status', async () => {
    const input: UpdateTaskInput = {
      id: 'task-1',
      status: 'In Progress'
    };

    const result = await updateTask(input);

    expect(result.id).toEqual('task-1');
    expect(result.status).toEqual('In Progress');
    expect(result.title).toEqual('Original Task'); // Unchanged
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    const dueDate = new Date('2024-12-31');
    const input: UpdateTaskInput = {
      id: 'task-1',
      title: 'Multi-field Update',
      description: 'Updated description',
      status: 'Completed',
      priority: 'High',
      assigneeId: 'user-1',
      dueDate: dueDate
    };

    const result = await updateTask(input);

    expect(result.id).toEqual('task-1');
    expect(result.title).toEqual('Multi-field Update');
    expect(result.description).toEqual('Updated description');
    expect(result.status).toEqual('Completed');
    expect(result.priority).toEqual('High');
    expect(result.assigneeId).toEqual('user-1');
    expect(result.dueDate).toEqual(dueDate);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update assignee to null', async () => {
    // First, set an assignee
    await db.update(tasksTable)
      .set({ assigneeId: 'user-1' })
      .where(eq(tasksTable.id, 'task-1'))
      .execute();

    const input: UpdateTaskInput = {
      id: 'task-1',
      assigneeId: null
    };

    const result = await updateTask(input);

    expect(result.id).toEqual('task-1');
    expect(result.assigneeId).toBeNull();
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update due date to null', async () => {
    // First, set a due date
    const initialDate = new Date('2024-01-01');
    await db.update(tasksTable)
      .set({ dueDate: initialDate })
      .where(eq(tasksTable.id, 'task-1'))
      .execute();

    const input: UpdateTaskInput = {
      id: 'task-1',
      dueDate: null
    };

    const result = await updateTask(input);

    expect(result.id).toEqual('task-1');
    expect(result.dueDate).toBeNull();
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save updates to database', async () => {
    const input: UpdateTaskInput = {
      id: 'task-1',
      title: 'Database Update Test',
      status: 'In Progress'
    };

    await updateTask(input);

    // Verify changes were persisted
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, 'task-1'))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toEqual('Database Update Test');
    expect(tasks[0].status).toEqual('In Progress');
    expect(tasks[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent task', async () => {
    const input: UpdateTaskInput = {
      id: 'non-existent-task',
      title: 'This will fail'
    };

    expect(async () => {
      await updateTask(input);
    }).toThrow(/Task with id non-existent-task not found/);
  });

  it('should handle empty update gracefully', async () => {
    const input: UpdateTaskInput = {
      id: 'task-1'
    };

    const result = await updateTask(input);

    expect(result.id).toEqual('task-1');
    expect(result.title).toEqual('Original Task'); // Unchanged
    expect(result.description).toEqual('Original description'); // Unchanged
    expect(result.updatedAt).toBeInstanceOf(Date); // Should still be updated
  });
});
