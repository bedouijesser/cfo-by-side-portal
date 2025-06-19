
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { organizationsTable, requestsTable } from '../db/schema';
import { getRequestsByOrganization } from '../handlers/get_requests_by_organization';

describe('getRequestsByOrganization', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return requests for a specific organization', async () => {
    // Create test organization
    const organization = await db.insert(organizationsTable)
      .values({
        id: 'org-1',
        name: 'Test Organization'
      })
      .returning()
      .execute();

    // Create test requests for the organization
    await db.insert(requestsTable)
      .values([
        {
          id: 'req-1',
          organizationId: 'org-1',
          title: 'First Request',
          description: 'First test request',
          status: 'Open'
        },
        {
          id: 'req-2',
          organizationId: 'org-1',
          title: 'Second Request',
          description: 'Second test request',
          status: 'In Progress'
        }
      ])
      .execute();

    const results = await getRequestsByOrganization('org-1');

    expect(results).toHaveLength(2);
    expect(results[0].organizationId).toEqual('org-1');
    expect(results[0].title).toEqual('First Request');
    expect(results[0].description).toEqual('First test request');
    expect(results[0].status).toEqual('Open');
    expect(results[0].createdAt).toBeInstanceOf(Date);
    expect(results[0].updatedAt).toBeInstanceOf(Date);

    expect(results[1].organizationId).toEqual('org-1');
    expect(results[1].title).toEqual('Second Request');
    expect(results[1].description).toEqual('Second test request');
    expect(results[1].status).toEqual('In Progress');
  });

  it('should return empty array when organization has no requests', async () => {
    // Create test organization
    await db.insert(organizationsTable)
      .values({
        id: 'org-empty',
        name: 'Empty Organization'
      })
      .execute();

    const results = await getRequestsByOrganization('org-empty');

    expect(results).toHaveLength(0);
  });

  it('should return empty array for non-existent organization', async () => {
    const results = await getRequestsByOrganization('non-existent-org');

    expect(results).toHaveLength(0);
  });

  it('should not return requests from other organizations', async () => {
    // Create two test organizations
    await db.insert(organizationsTable)
      .values([
        {
          id: 'org-1',
          name: 'Organization 1'
        },
        {
          id: 'org-2',
          name: 'Organization 2'
        }
      ])
      .execute();

    // Create requests for both organizations
    await db.insert(requestsTable)
      .values([
        {
          id: 'req-1',
          organizationId: 'org-1',
          title: 'Org 1 Request',
          description: 'Request for organization 1',
          status: 'Open'
        },
        {
          id: 'req-2',
          organizationId: 'org-2',
          title: 'Org 2 Request',
          description: 'Request for organization 2',
          status: 'Open'
        }
      ])
      .execute();

    const results = await getRequestsByOrganization('org-1');

    expect(results).toHaveLength(1);
    expect(results[0].organizationId).toEqual('org-1');
    expect(results[0].title).toEqual('Org 1 Request');
  });
});
