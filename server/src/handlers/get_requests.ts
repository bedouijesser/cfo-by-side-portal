
import { db } from '../db';
import { requestsTable } from '../db/schema';
import { type Request } from '../schema';

export const getRequests = async (): Promise<Request[]> => {
  try {
    const results = await db.select()
      .from(requestsTable)
      .execute();

    return results.map(request => ({
      ...request,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    }));
  } catch (error) {
    console.error('Failed to get requests:', error);
    throw error;
  }
};
