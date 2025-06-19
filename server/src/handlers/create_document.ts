
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type CreateDocumentInput, type Document } from '../schema';

export const createDocument = async (input: CreateDocumentInput): Promise<Document> => {
  try {
    // Insert document record
    const result = await db.insert(documentsTable)
      .values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        requestId: input.requestId || null,
        taskId: input.taskId || null,
        uploaderId: input.uploaderId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        fileSize: input.fileSize
      })
      .returning()
      .execute();

    const document = result[0];
    return {
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
    };
  } catch (error) {
    console.error('Document creation failed:', error);
    throw error;
  }
};
