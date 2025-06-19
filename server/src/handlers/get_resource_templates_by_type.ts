
import { db } from '../db';
import { resourceTemplatesTable } from '../db/schema';
import { type ResourceTemplate } from '../schema';
import { eq } from 'drizzle-orm';

export const getResourceTemplatesByType = async (type: 'document_template' | 'calculator'): Promise<ResourceTemplate[]> => {
  try {
    const results = await db.select()
      .from(resourceTemplatesTable)
      .where(eq(resourceTemplatesTable.type, type))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get resource templates by type:', error);
    throw error;
  }
};
