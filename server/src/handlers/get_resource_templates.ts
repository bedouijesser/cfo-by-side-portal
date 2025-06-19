
import { db } from '../db';
import { resourceTemplatesTable } from '../db/schema';
import { type ResourceTemplate } from '../schema';

export const getResourceTemplates = async (): Promise<ResourceTemplate[]> => {
  try {
    const results = await db.select()
      .from(resourceTemplatesTable)
      .execute();

    return results.map(template => ({
      ...template,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));
  } catch (error) {
    console.error('Failed to retrieve resource templates:', error);
    throw error;
  }
};
