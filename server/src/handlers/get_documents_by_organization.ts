
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type Document } from '../schema';
import { eq } from 'drizzle-orm';

export const getDocumentsByOrganization = async (organizationId: string): Promise<Document[]> => {
  try {
    const results = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.organizationId, organizationId))
      .execute();

    return results.map(document => ({
      id: document.id,
      organizationId: document.organizationId,
      requestId: document.requestId,
      taskId: document.taskId,
      uploaderId: document.uploaderId,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }));
  } catch (error) {
    console.error('Failed to get documents by organization:', error);
    throw error;
  }
};
