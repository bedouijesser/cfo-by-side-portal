
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Task } from '../schema';

export const getTasksByRequest = async (requestId: string): Promise<Task[]> => {
  try {
    const results = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.requestId, requestId))
      .execute();

    return results.map(task => ({
      ...task,
      // Convert timestamp fields to proper Date objects
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate
    }));
  } catch (error) {
    console.error('Failed to get tasks by request:', error);
    throw error;
  }
};
