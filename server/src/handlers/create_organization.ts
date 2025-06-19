
import { db } from '../db';
import { organizationsTable } from '../db/schema';
import { type CreateOrganizationInput, type Organization } from '../schema';
import { nanoid } from 'nanoid';

export const createOrganization = async (input: CreateOrganizationInput): Promise<Organization> => {
  try {
    // Insert organization record
    const result = await db.insert(organizationsTable)
      .values({
        id: nanoid(),
        name: input.name
      })
      .returning()
      .execute();

    const organization = result[0];
    return {
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    };
  } catch (error) {
    console.error('Organization creation failed:', error);
    throw error;
  }
};
