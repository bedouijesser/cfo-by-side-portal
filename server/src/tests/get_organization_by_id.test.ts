
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { organizationsTable } from '../db/schema';
import { getOrganizationById } from '../handlers/get_organization_by_id';

describe('getOrganizationById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return organization when found', async () => {
    // Create test organization
    const testOrg = await db.insert(organizationsTable)
      .values({
        id: 'test-org-1',
        name: 'Test Organization'
      })
      .returning()
      .execute();

    const result = await getOrganizationById('test-org-1');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('test-org-1');
    expect(result!.name).toEqual('Test Organization');
    expect(result!.createdAt).toBeInstanceOf(Date);
    expect(result!.updatedAt).toBeInstanceOf(Date);
  });

  it('should return null when organization not found', async () => {
    const result = await getOrganizationById('non-existent-org');

    expect(result).toBeNull();
  });

  it('should return correct organization when multiple exist', async () => {
    // Create multiple test organizations
    await db.insert(organizationsTable)
      .values([
        {
          id: 'org-1',
          name: 'Organization One'
        },
        {
          id: 'org-2',
          name: 'Organization Two'
        },
        {
          id: 'org-3',
          name: 'Organization Three'
        }
      ])
      .execute();

    const result = await getOrganizationById('org-2');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('org-2');
    expect(result!.name).toEqual('Organization Two');
  });
});
