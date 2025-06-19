
import { db } from '../db';
import { organizationsTable } from '../db/schema';
import { type Organization } from '../schema';
import { eq } from 'drizzle-orm';

export const getOrganizationById = async (id: string): Promise<Organization | null> => {
  try {
    const results = await db.select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Get organization by ID failed:', error);
    throw error;
  }
};
