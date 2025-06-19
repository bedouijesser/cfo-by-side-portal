
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTask = async (input: UpdateTaskInput): Promise<Task> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{
      title: string;
      description: string;
      status: 'Not Started' | 'In Progress' | 'Awaiting Client Feedback' | 'Completed';
      assigneeId: string | null;
      priority: 'High' | 'Medium' | 'Low';
      dueDate: Date | null;
      updatedAt: Date;
    }> = {
      updatedAt: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.assigneeId !== undefined) {
      updateData.assigneeId = input.assigneeId;
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate;
    }

    // Update task record
    const result = await db.update(tasksTable)
      .set(updateData)
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Task update failed:', error);
    throw error;
  }
};
