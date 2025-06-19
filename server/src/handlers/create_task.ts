
import { db } from '../db';
import { tasksTable, requestsTable } from '../db/schema';
import { type CreateTaskInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  try {
    // Verify that the request exists
    const request = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.id, input.requestId))
      .execute();

    if (request.length === 0) {
      throw new Error(`Request with id ${input.requestId} not found`);
    }

    // If assigneeId is provided, we should verify the user exists
    // but for now we'll let the foreign key constraint handle it

    // Insert task record
    const result = await db.insert(tasksTable)
      .values({
        id: randomUUID(),
        requestId: input.requestId,
        title: input.title,
        description: input.description,
        assigneeId: input.assigneeId || null,
        priority: input.priority,
        dueDate: input.dueDate || null,
        status: 'Not Started' // Default status
      })
      .returning()
      .execute();

    const task = result[0];
    return {
      id: task.id,
      requestId: task.requestId,
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeId: task.assigneeId,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  } catch (error) {
    console.error('Task creation failed:', error);
    throw error;
  }
};
