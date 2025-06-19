
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { requestsTable, organizationsTable } from '../db/schema';
import { type CreateRequestInput } from '../schema';
import { createRequest } from '../handlers/create_request';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('createRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testOrganizationId: string;

  beforeEach(async () => {
    // Create prerequisite organization
    testOrganizationId = nanoid();
    await db.insert(organizationsTable)
      .values({
        id: testOrganizationId,
        name: 'Test Organization'
      })
      .execute();
  });

  const testInput: CreateRequestInput = {
    organizationId: '', // Will be set in beforeEach
    title: 'Test Request',
    description: 'A request for testing purposes'
  };

  it('should create a request with valid input', async () => {
    const input = { ...testInput, organizationId: testOrganizationId };
    const result = await createRequest(input);

    // Validate returned request
    expect(result.id).toBeDefined();
    expect(result.organizationId).toEqual(testOrganizationId);
    expect(result.title).toEqual('Test Request');
    expect(result.description).toEqual('A request for testing purposes');
    expect(result.status).toEqual('Open');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save request to database', async () => {
    const input = { ...testInput, organizationId: testOrganizationId };
    const result = await createRequest(input);

    // Query database to verify persistence
    const requests = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.id, result.id))
      .execute();

    expect(requests).toHaveLength(1);
    const savedRequest = requests[0];
    expect(savedRequest.organizationId).toEqual(testOrganizationId);
    expect(savedRequest.title).toEqual('Test Request');
    expect(savedRequest.description).toEqual('A request for testing purposes');
    expect(savedRequest.status).toEqual('Open');
    expect(savedRequest.createdAt).toBeInstanceOf(Date);
    expect(savedRequest.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent organization', async () => {
    const input = { 
      ...testInput, 
      organizationId: 'non-existent-org-id'
    };

    await expect(createRequest(input)).rejects.toThrow(/organization not found/i);
  });

  it('should create request with long description', async () => {
    const longDescription = 'A'.repeat(1000);
    const input = {
      ...testInput,
      organizationId: testOrganizationId,
      description: longDescription
    };

    const result = await createRequest(input);

    expect(result.description).toEqual(longDescription);
    expect(result.description.length).toEqual(1000);
  });

  it('should create multiple requests for same organization', async () => {
    const input1 = {
      ...testInput,
      organizationId: testOrganizationId,
      title: 'First Request'
    };
    const input2 = {
      ...testInput,
      organizationId: testOrganizationId,
      title: 'Second Request'
    };

    const result1 = await createRequest(input1);
    const result2 = await createRequest(input2);

    // Verify both requests are created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.organizationId).toEqual(testOrganizationId);
    expect(result2.organizationId).toEqual(testOrganizationId);
    expect(result1.title).toEqual('First Request');
    expect(result2.title).toEqual('Second Request');

    // Verify both requests exist in database
    const allRequests = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.organizationId, testOrganizationId))
      .execute();

    expect(allRequests).toHaveLength(2);
  });

  it('should set default status to Open', async () => {
    const input = { ...testInput, organizationId: testOrganizationId };
    const result = await createRequest(input);

    expect(result.status).toEqual('Open');

    // Verify in database
    const savedRequest = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.id, result.id))
      .execute();

    expect(savedRequest[0].status).toEqual('Open');
  });
});
