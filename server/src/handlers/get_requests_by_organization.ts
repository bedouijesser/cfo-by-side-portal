
import { db } from '../db';
import { requestsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Request } from '../schema';

export const getRequestsByOrganization = async (organizationId: string): Promise<Request[]> => {
  try {
    const results = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.organizationId, organizationId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get requests by organization:', error);
    throw error;
  }
};
