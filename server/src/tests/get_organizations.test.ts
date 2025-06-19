
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { organizationsTable } from '../db/schema';
import { getOrganizations } from '../handlers/get_organizations';

describe('getOrganizations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no organizations exist', async () => {
    const result = await getOrganizations();
    expect(result).toEqual([]);
  });

  it('should return all organizations', async () => {
    // Create test organizations
    await db.insert(organizationsTable)
      .values([
        {
          id: 'org1',
          name: 'Test Organization 1'
        },
        {
          id: 'org2',
          name: 'Test Organization 2'
        }
      ])
      .execute();

    const result = await getOrganizations();

    expect(result).toHaveLength(2);
    
    // Verify first organization
    const org1 = result.find(org => org.id === 'org1');
    expect(org1).toBeDefined();
    expect(org1!.name).toEqual('Test Organization 1');
    expect(org1!.createdAt).toBeInstanceOf(Date);
    expect(org1!.updatedAt).toBeInstanceOf(Date);

    // Verify second organization
    const org2 = result.find(org => org.id === 'org2');
    expect(org2).toBeDefined();
    expect(org2!.name).toEqual('Test Organization 2');
    expect(org2!.createdAt).toBeInstanceOf(Date);
    expect(org2!.updatedAt).toBeInstanceOf(Date);
  });

  it('should return organizations with correct field types', async () => {
    await db.insert(organizationsTable)
      .values({
        id: 'test-org',
        name: 'Type Test Organization'
      })
      .execute();

    const result = await getOrganizations();

    expect(result).toHaveLength(1);
    const org = result[0];
    
    expect(typeof org.id).toBe('string');
    expect(typeof org.name).toBe('string');
    expect(org.createdAt).toBeInstanceOf(Date);
    expect(org.updatedAt).toBeInstanceOf(Date);
  });
});
