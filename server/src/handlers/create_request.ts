
import { db } from '../db';
import { requestsTable, organizationsTable } from '../db/schema';
import { type CreateRequestInput, type Request } from '../schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const createRequest = async (input: CreateRequestInput): Promise<Request> => {
  try {
    // Verify organization exists to prevent foreign key constraint violation
    const existingOrganization = await db.select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, input.organizationId))
      .execute();

    if (existingOrganization.length === 0) {
      throw new Error('Organization not found');
    }

    // Insert request record
    const result = await db.insert(requestsTable)
      .values({
        id: nanoid(),
        organizationId: input.organizationId,
        title: input.title,
        description: input.description,
        status: 'Open' // Default status as defined in schema
      })
      .returning()
      .execute();

    const request = result[0];
    return {
      id: request.id,
      organizationId: request.organizationId,
      title: request.title,
      description: request.description,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  } catch (error) {
    console.error('Request creation failed:', error);
    throw error;
  }
};
