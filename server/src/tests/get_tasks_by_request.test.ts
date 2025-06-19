
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, organizationsTable, requestsTable, tasksTable } from '../db/schema';
import { getTasksByRequest } from '../handlers/get_tasks_by_request';

const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'Client-User' as const
};

const testOrganization = {
  id: 'org-1',
  name: 'Test Organization'
};

const testRequests = [
  {
    id: 'request-1',
    organizationId: 'org-1',
    title: 'Test Request',
    description: 'A test request'
  },
  {
    id: 'other-request',
    organizationId: 'org-1',
    title: 'Other Request',
    description: 'Another test request'
  }
];

const testTasks = [
  {
    id: 'task-1',
    requestId: 'request-1',
    title: 'First Task',
    description: 'First task description',
    priority: 'High' as const,
    assigneeId: 'user-1'
  },
  {
    id: 'task-2',
    requestId: 'request-1',
    title: 'Second Task',
    description: 'Second task description',
    priority: 'Medium' as const,
    assigneeId: null,
    dueDate: new Date('2024-12-31')
  },
  {
    id: 'task-3',
    requestId: 'other-request',
    title: 'Other Task',
    description: 'Task for different request',
    priority: 'Low' as const,
    assigneeId: null
  }
];

describe('getTasksByRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get all tasks for a specific request', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(organizationsTable).values(testOrganization).execute();
    await db.insert(requestsTable).values(testRequests).execute();
    await db.insert(tasksTable).values(testTasks).execute();

    const result = await getTasksByRequest('request-1');

    expect(result).toHaveLength(2);
    
    // Check first task
    const firstTask = result.find(t => t.id === 'task-1');
    expect(firstTask).toBeDefined();
    expect(firstTask!.title).toEqual('First Task');
    expect(firstTask!.description).toEqual('First task description');
    expect(firstTask!.priority).toEqual('High');
    expect(firstTask!.assigneeId).toEqual('user-1');
    expect(firstTask!.requestId).toEqual('request-1');
    expect(firstTask!.status).toEqual('Not Started'); // Default status
    expect(firstTask!.createdAt).toBeInstanceOf(Date);
    expect(firstTask!.updatedAt).toBeInstanceOf(Date);
    expect(firstTask!.dueDate).toBeNull();

    // Check second task
    const secondTask = result.find(t => t.id === 'task-2');
    expect(secondTask).toBeDefined();
    expect(secondTask!.title).toEqual('Second Task');
    expect(secondTask!.description).toEqual('Second task description');
    expect(secondTask!.priority).toEqual('Medium');
    expect(secondTask!.assigneeId).toBeNull();
    expect(secondTask!.requestId).toEqual('request-1');
    expect(secondTask!.dueDate).toBeInstanceOf(Date);
  });

  it('should return empty array for request with no tasks', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(organizationsTable).values(testOrganization).execute();
    await db.insert(requestsTable).values(testRequests[0]).execute();

    const result = await getTasksByRequest('request-1');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent request', async () => {
    const result = await getTasksByRequest('non-existent-request');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should not return tasks from other requests', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(organizationsTable).values(testOrganization).execute();
    await db.insert(requestsTable).values(testRequests).execute();
    await db.insert(tasksTable).values(testTasks).execute();

    const result = await getTasksByRequest('request-1');

    expect(result).toHaveLength(2);
    result.forEach(task => {
      expect(task.requestId).toEqual('request-1');
    });

    // Verify other request task is not included
    const taskFromOtherRequest = result.find(t => t.id === 'task-3');
    expect(taskFromOtherRequest).toBeUndefined();
  });
});
