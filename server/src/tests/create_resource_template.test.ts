
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { resourceTemplatesTable } from '../db/schema';
import { type CreateResourceTemplateInput } from '../schema';
import { createResourceTemplate } from '../handlers/create_resource_template';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateResourceTemplateInput = {
  name: 'Test Document Template',
  type: 'document_template',
  content: 'This is a test document template content',
  category: 'Legal'
};

describe('createResourceTemplate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a resource template', async () => {
    const result = await createResourceTemplate(testInput);

    // Basic field validation
    expect(result.id).toBeDefined();
    expect(result.name).toEqual('Test Document Template');
    expect(result.type).toEqual('document_template');
    expect(result.content).toEqual('This is a test document template content');
    expect(result.category).toEqual('Legal');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save resource template to database', async () => {
    const result = await createResourceTemplate(testInput);

    // Query using proper drizzle syntax
    const templates = await db.select()
      .from(resourceTemplatesTable)
      .where(eq(resourceTemplatesTable.id, result.id))
      .execute();

    expect(templates).toHaveLength(1);
    expect(templates[0].name).toEqual('Test Document Template');
    expect(templates[0].type).toEqual('document_template');
    expect(templates[0].content).toEqual('This is a test document template content');
    expect(templates[0].category).toEqual('Legal');
    expect(templates[0].createdAt).toBeInstanceOf(Date);
    expect(templates[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should create calculator type resource template', async () => {
    const calculatorInput: CreateResourceTemplateInput = {
      name: 'Tax Calculator',
      type: 'calculator',
      content: 'Calculator logic and formulas',
      category: 'Tax'
    };

    const result = await createResourceTemplate(calculatorInput);

    expect(result.name).toEqual('Tax Calculator');
    expect(result.type).toEqual('calculator');
    expect(result.content).toEqual('Calculator logic and formulas');
    expect(result.category).toEqual('Tax');
  });

  it('should create multiple resource templates with unique IDs', async () => {
    const input1: CreateResourceTemplateInput = {
      name: 'Template 1',
      type: 'document_template',
      content: 'Content 1',
      category: 'Category 1'
    };

    const input2: CreateResourceTemplateInput = {
      name: 'Template 2',
      type: 'calculator',
      content: 'Content 2',
      category: 'Category 2'
    };

    const result1 = await createResourceTemplate(input1);
    const result2 = await createResourceTemplate(input2);

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('Template 1');
    expect(result2.name).toEqual('Template 2');
  });
});
