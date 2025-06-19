
import { db } from '../db';
import { requestsTable } from '../db/schema';
import { type UpdateRequestInput, type Request } from '../schema';
import { eq } from 'drizzle-orm';

export const updateRequest = async (input: UpdateRequestInput): Promise<Request> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{
      title: string;
      description: string;
      status: 'Open' | 'In Progress' | 'Completed' | 'Closed';
    }> = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    // Update request record
    const result = await db.update(requestsTable)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(requestsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Request with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Request update failed:', error);
    throw error;
  }
};
