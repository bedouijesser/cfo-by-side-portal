
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { requestsTable, organizationsTable } from '../db/schema';
import { type UpdateRequestInput } from '../schema';
import { updateRequest } from '../handlers/update_request';
import { eq } from 'drizzle-orm';

describe('updateRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let organizationId: string;
  let requestId: string;

  beforeEach(async () => {
    // Create organization first
    const orgResult = await db.insert(organizationsTable)
      .values({
        id: 'test-org-1',
        name: 'Test Organization'
      })
      .returning()
      .execute();
    organizationId = orgResult[0].id;

    // Create request
    const requestResult = await db.insert(requestsTable)
      .values({
        id: 'test-request-1',
        organizationId,
        title: 'Original Title',
        description: 'Original description',
        status: 'Open'
      })
      .returning()
      .execute();
    requestId = requestResult[0].id;
  });

  it('should update request title', async () => {
    const input: UpdateRequestInput = {
      id: requestId,
      title: 'Updated Title'
    };

    const result = await updateRequest(input);

    expect(result.id).toEqual(requestId);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Original description');
    expect(result.status).toEqual('Open');
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update request description', async () => {
    const input: UpdateRequestInput = {
      id: requestId,
      description: 'Updated description'
    };

    const result = await updateRequest(input);

    expect(result.id).toEqual(requestId);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Updated description');
    expect(result.status).toEqual('Open');
  });

  it('should update request status', async () => {
    const input: UpdateRequestInput = {
      id: requestId,
      status: 'In Progress'
    };

    const result = await updateRequest(input);

    expect(result.id).toEqual(requestId);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Original description');
    expect(result.status).toEqual('In Progress');
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateRequestInput = {
      id: requestId,
      title: 'New Title',
      description: 'New description',
      status: 'Completed'
    };

    const result = await updateRequest(input);

    expect(result.id).toEqual(requestId);
    expect(result.title).toEqual('New Title');
    expect(result.description).toEqual('New description');
    expect(result.status).toEqual('Completed');
    expect(result.organizationId).toEqual(organizationId);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save updated request to database', async () => {
    const input: UpdateRequestInput = {
      id: requestId,
      title: 'Database Updated Title',
      status: 'Closed'
    };

    await updateRequest(input);

    const requests = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.id, requestId))
      .execute();

    expect(requests).toHaveLength(1);
    expect(requests[0].title).toEqual('Database Updated Title');
    expect(requests[0].status).toEqual('Closed');
    expect(requests[0].description).toEqual('Original description');
  });

  it('should throw error for non-existent request', async () => {
    const input: UpdateRequestInput = {
      id: 'non-existent-id',
      title: 'Will not work'
    };

    await expect(updateRequest(input)).rejects.toThrow(/not found/i);
  });

  it('should update updatedAt timestamp', async () => {
    const originalRequest = await db.select()
      .from(requestsTable)
      .where(eq(requestsTable.id, requestId))
      .execute();

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateRequestInput = {
      id: requestId,
      title: 'Timestamp Test'
    };

    const result = await updateRequest(input);

    expect(result.updatedAt.getTime()).toBeGreaterThan(originalRequest[0].updatedAt.getTime());
  });
});
