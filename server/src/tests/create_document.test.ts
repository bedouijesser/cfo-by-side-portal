
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable, usersTable, organizationsTable, requestsTable, tasksTable } from '../db/schema';
import { type CreateDocumentInput } from '../schema';
import { createDocument } from '../handlers/create_document';
import { eq } from 'drizzle-orm';

describe('createDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;
  let organizationId: string;
  let requestId: string;
  let taskId: string;

  beforeEach(async () => {
    // Create prerequisite data
    userId = crypto.randomUUID();
    organizationId = crypto.randomUUID();
    requestId = crypto.randomUUID();
    taskId = crypto.randomUUID();

    // Create user
    await db.insert(usersTable).values({
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      role: 'Client-User'
    }).execute();

    // Create organization
    await db.insert(organizationsTable).values({
      id: organizationId,
      name: 'Test Organization'
    }).execute();

    // Create request
    await db.insert(requestsTable).values({
      id: requestId,
      organizationId: organizationId,
      title: 'Test Request',
      description: 'A test request'
    }).execute();

    // Create task
    await db.insert(tasksTable).values({
      id: taskId,
      requestId: requestId,
      title: 'Test Task',
      description: 'A test task',
      priority: 'Medium'
    }).execute();
  });

  it('should create a document with all fields', async () => {
    const testInput: CreateDocumentInput = {
      organizationId: organizationId,
      requestId: requestId,
      taskId: taskId,
      uploaderId: userId,
      fileName: 'test-document.pdf',
      fileUrl: 'https://example.com/test-document.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024000
    };

    const result = await createDocument(testInput);

    // Basic field validation
    expect(result.organizationId).toEqual(organizationId);
    expect(result.requestId).toEqual(requestId);
    expect(result.taskId).toEqual(taskId);
    expect(result.uploaderId).toEqual(userId);
    expect(result.fileName).toEqual('test-document.pdf');
    expect(result.fileUrl).toEqual('https://example.com/test-document.pdf');
    expect(result.mimeType).toEqual('application/pdf');
    expect(result.fileSize).toEqual(1024000);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a document with optional fields as null', async () => {
    const testInput: CreateDocumentInput = {
      organizationId: organizationId,
      uploaderId: userId,
      fileName: 'simple-document.txt',
      fileUrl: 'https://example.com/simple-document.txt',
      mimeType: 'text/plain',
      fileSize: 500
    };

    const result = await createDocument(testInput);

    expect(result.organizationId).toEqual(organizationId);
    expect(result.requestId).toBeNull();
    expect(result.taskId).toBeNull();
    expect(result.uploaderId).toEqual(userId);
    expect(result.fileName).toEqual('simple-document.txt');
    expect(result.fileUrl).toEqual('https://example.com/simple-document.txt');
    expect(result.mimeType).toEqual('text/plain');
    expect(result.fileSize).toEqual(500);
  });

  it('should save document to database', async () => {
    const testInput: CreateDocumentInput = {
      organizationId: organizationId,
      requestId: requestId,
      uploaderId: userId,
      fileName: 'database-test.docx',
      fileUrl: 'https://example.com/database-test.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 2048000
    };

    const result = await createDocument(testInput);

    // Query database to verify document was saved
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, result.id))
      .execute();

    expect(documents).toHaveLength(1);
    const savedDocument = documents[0];
    expect(savedDocument.organizationId).toEqual(organizationId);
    expect(savedDocument.requestId).toEqual(requestId);
    expect(savedDocument.taskId).toBeNull();
    expect(savedDocument.uploaderId).toEqual(userId);
    expect(savedDocument.fileName).toEqual('database-test.docx');
    expect(savedDocument.fileUrl).toEqual('https://example.com/database-test.docx');
    expect(savedDocument.mimeType).toEqual('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(savedDocument.fileSize).toEqual(2048000);
    expect(savedDocument.createdAt).toBeInstanceOf(Date);
    expect(savedDocument.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle large file sizes', async () => {
    const testInput: CreateDocumentInput = {
      organizationId: organizationId,
      uploaderId: userId,
      fileName: 'large-file.zip',
      fileUrl: 'https://example.com/large-file.zip',
      mimeType: 'application/zip',
      fileSize: 104857600 // 100MB
    };

    const result = await createDocument(testInput);

    expect(result.fileSize).toEqual(104857600);
    expect(typeof result.fileSize).toBe('number');
  });
});
