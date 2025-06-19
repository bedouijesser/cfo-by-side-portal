
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { organizationsTable } from '../db/schema';
import { type CreateOrganizationInput } from '../schema';
import { createOrganization } from '../handlers/create_organization';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateOrganizationInput = {
  name: 'Test Organization'
};

describe('createOrganization', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an organization', async () => {
    const result = await createOrganization(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Organization');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('string');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save organization to database', async () => {
    const result = await createOrganization(testInput);

    // Query using proper drizzle syntax
    const organizations = await db.select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, result.id))
      .execute();

    expect(organizations).toHaveLength(1);
    expect(organizations[0].name).toEqual('Test Organization');
    expect(organizations[0].id).toEqual(result.id);
    expect(organizations[0].createdAt).toBeInstanceOf(Date);
    expect(organizations[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should create organizations with different names', async () => {
    const result1 = await createOrganization({ name: 'Organization One' });
    const result2 = await createOrganization({ name: 'Organization Two' });

    // Should have different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('Organization One');
    expect(result2.name).toEqual('Organization Two');

    // Verify both exist in database
    const organizations = await db.select()
      .from(organizationsTable)
      .execute();

    expect(organizations).toHaveLength(2);
    
    const orgNames = organizations.map(org => org.name).sort();
    expect(orgNames).toEqual(['Organization One', 'Organization Two']);
  });

  it('should handle long organization names', async () => {
    const longName = 'A'.repeat(100);
    const result = await createOrganization({ name: longName });

    expect(result.name).toEqual(longName);
    expect(result.name.length).toEqual(100);

    // Verify in database
    const organizations = await db.select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, result.id))
      .execute();

    expect(organizations[0].name).toEqual(longName);
  });

  it('should set timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createOrganization(testInput);
    const afterCreation = new Date();

    // Timestamps should be within reasonable range
    expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());

    // Both timestamps should be very close (same operation)
    const timeDiff = Math.abs(result.updatedAt.getTime() - result.createdAt.getTime());
    expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
  });
});
