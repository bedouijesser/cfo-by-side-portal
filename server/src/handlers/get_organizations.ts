
import { db } from '../db';
import { organizationsTable } from '../db/schema';
import { type Organization } from '../schema';

export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    const results = await db.select()
      .from(organizationsTable)
      .execute();

    return results.map(org => ({
      ...org,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
  } catch (error) {
    console.error('Get organizations failed:', error);
    throw error;
  }
};
