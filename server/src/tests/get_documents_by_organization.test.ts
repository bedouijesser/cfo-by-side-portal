
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, organizationsTable, documentsTable } from '../db/schema';
import { getDocumentsByOrganization } from '../handlers/get_documents_by_organization';

const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'Client-User' as const
};

const testOrganization = {
  id: 'org-1',
  name: 'Test Organization'
};

const testDocument = {
  id: 'doc-1',
  organizationId: 'org-1',
  requestId: null,
  taskId: null,
  uploaderId: 'user-1',
  fileName: 'test-document.pdf',
  fileUrl: 'https://example.com/files/test-document.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024
};

describe('getDocumentsByOrganization', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get documents by organization ID', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser);
    await db.insert(organizationsTable).values(testOrganization);
    await db.insert(documentsTable).values(testDocument);

    const result = await getDocumentsByOrganization('org-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('doc-1');
    expect(result[0].organizationId).toEqual('org-1');
    expect(result[0].fileName).toEqual('test-document.pdf');
    expect(result[0].fileUrl).toEqual('https://example.com/files/test-document.pdf');
    expect(result[0].mimeType).toEqual('application/pdf');
    expect(result[0].fileSize).toEqual(1024);
    expect(result[0].uploaderId).toEqual('user-1');
    expect(result[0].requestId).toBeNull();
    expect(result[0].taskId).toBeNull();
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should return multiple documents for the same organization', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser);
    await db.insert(organizationsTable).values(testOrganization);
    
    const document2 = {
      id: 'doc-2',
      organizationId: 'org-1',
      requestId: null,
      taskId: null,
      uploaderId: 'user-1',
      fileName: 'second-document.docx',
      fileUrl: 'https://example.com/files/second-document.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 2048
    };

    await db.insert(documentsTable).values([testDocument, document2]);

    const result = await getDocumentsByOrganization('org-1');

    expect(result).toHaveLength(2);
    expect(result.map(doc => doc.id)).toContain('doc-1');
    expect(result.map(doc => doc.id)).toContain('doc-2');
    expect(result.every(doc => doc.organizationId === 'org-1')).toBe(true);
  });

  it('should return empty array when no documents exist for organization', async () => {
    // Create prerequisite data but no documents
    await db.insert(usersTable).values(testUser);
    await db.insert(organizationsTable).values(testOrganization);

    const result = await getDocumentsByOrganization('org-1');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should not return documents from different organizations', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser);
    await db.insert(organizationsTable).values([
      testOrganization,
      { id: 'org-2', name: 'Different Organization' }
    ]);

    const document2 = {
      id: 'doc-2',
      organizationId: 'org-2',
      requestId: null,
      taskId: null,
      uploaderId: 'user-1',
      fileName: 'different-org-document.pdf',
      fileUrl: 'https://example.com/files/different-org-document.pdf',
      mimeType: 'application/pdf',
      fileSize: 512
    };

    await db.insert(documentsTable).values([testDocument, document2]);

    const result = await getDocumentsByOrganization('org-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('doc-1');
    expect(result[0].organizationId).toEqual('org-1');
  });
});
