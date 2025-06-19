
import { db } from '../db';
import { resourceTemplatesTable } from '../db/schema';
import { type CreateResourceTemplateInput, type ResourceTemplate } from '../schema';
import { nanoid } from 'nanoid';

export const createResourceTemplate = async (input: CreateResourceTemplateInput): Promise<ResourceTemplate> => {
  try {
    // Insert resource template record
    const result = await db.insert(resourceTemplatesTable)
      .values({
        id: nanoid(),
        name: input.name,
        type: input.type,
        content: input.content,
        category: input.category
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Resource template creation failed:', error);
    throw error;
  }
};
