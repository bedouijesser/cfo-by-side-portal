
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { requestsTable, organizationsTable } from '../db/schema';
import { getRequests } from '../handlers/get_requests';

describe('getRequests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no requests exist', async () => {
    const result = await getRequests();
    
    expect(result).toEqual([]);
  });

  it('should return all requests', async () => {
    // Create test organization first
    const organizationId = crypto.randomUUID();
    await db.insert(organizationsTable)
      .values({
        id: organizationId,
        name: 'Test Organization'
      })
      .execute();

    // Create test requests
    const request1Id = crypto.randomUUID();
    const request2Id = crypto.randomUUID();
    
    await db.insert(requestsTable)
      .values([
        {
          id: request1Id,
          organizationId: organizationId,
          title: 'First Request',
          description: 'Description for first request',
          status: 'Open'
        },
        {
          id: request2Id,
          organizationId: organizationId,
          title: 'Second Request',
          description: 'Description for second request',
          status: 'In Progress'
        }
      ])
      .execute();

    const result = await getRequests();

    expect(result).toHaveLength(2);
    
    // Verify first request
    const firstRequest = result.find(r => r.id === request1Id);
    expect(firstRequest).toBeDefined();
    expect(firstRequest!.title).toEqual('First Request');
    expect(firstRequest!.description).toEqual('Description for first request');
    expect(firstRequest!.status).toEqual('Open');
    expect(firstRequest!.organizationId).toEqual(organizationId);
    expect(firstRequest!.createdAt).toBeInstanceOf(Date);
    expect(firstRequest!.updatedAt).toBeInstanceOf(Date);

    // Verify second request
    const secondRequest = result.find(r => r.id === request2Id);
    expect(secondRequest).toBeDefined();
    expect(secondRequest!.title).toEqual('Second Request');
    expect(secondRequest!.description).toEqual('Description for second request');
    expect(secondRequest!.status).toEqual('In Progress');
    expect(secondRequest!.organizationId).toEqual(organizationId);
    expect(secondRequest!.createdAt).toBeInstanceOf(Date);
    expect(secondRequest!.updatedAt).toBeInstanceOf(Date);
  });

  it('should return requests with correct data types', async () => {
    // Create test organization first
    const organizationId = crypto.randomUUID();
    await db.insert(organizationsTable)
      .values({
        id: organizationId,
        name: 'Test Organization'
      })
      .execute();

    // Create test request
    const requestId = crypto.randomUUID();
    await db.insert(requestsTable)
      .values({
        id: requestId,
        organizationId: organizationId,
        title: 'Test Request',
        description: 'Test description',
        status: 'Completed'
      })
      .execute();

    const result = await getRequests();

    expect(result).toHaveLength(1);
    const request = result[0];
    
    // Verify data types
    expect(typeof request.id).toBe('string');
    expect(typeof request.organizationId).toBe('string');
    expect(typeof request.title).toBe('string');
    expect(typeof request.description).toBe('string');
    expect(typeof request.status).toBe('string');
    expect(request.createdAt).toBeInstanceOf(Date);
    expect(request.updatedAt).toBeInstanceOf(Date);
  });
});
