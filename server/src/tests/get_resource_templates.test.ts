
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { resourceTemplatesTable } from '../db/schema';
import { type CreateResourceTemplateInput } from '../schema';
import { getResourceTemplates } from '../handlers/get_resource_templates';

// Test data
const testTemplate1: CreateResourceTemplateInput = {
  name: 'Tax Calculation Template',
  type: 'calculator',
  content: 'Tax calculation formula and steps',
  category: 'taxation'
};

const testTemplate2: CreateResourceTemplateInput = {
  name: 'Invoice Template',
  type: 'document_template',
  content: 'Standard invoice template content',
  category: 'billing'
};

describe('getResourceTemplates', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no templates exist', async () => {
    const result = await getResourceTemplates();

    expect(result).toEqual([]);
  });

  it('should retrieve all resource templates', async () => {
    // Create test templates
    await db.insert(resourceTemplatesTable)
      .values([
        {
          id: 'template-1',
          ...testTemplate1
        },
        {
          id: 'template-2',
          ...testTemplate2
        }
      ])
      .execute();

    const result = await getResourceTemplates();

    expect(result).toHaveLength(2);
    
    // Verify first template
    const template1 = result.find(t => t.name === 'Tax Calculation Template');
    expect(template1).toBeDefined();
    expect(template1!.type).toEqual('calculator');
    expect(template1!.content).toEqual('Tax calculation formula and steps');
    expect(template1!.category).toEqual('taxation');
    expect(template1!.id).toEqual('template-1');
    expect(template1!.createdAt).toBeInstanceOf(Date);
    expect(template1!.updatedAt).toBeInstanceOf(Date);

    // Verify second template
    const template2 = result.find(t => t.name === 'Invoice Template');
    expect(template2).toBeDefined();
    expect(template2!.type).toEqual('document_template');
    expect(template2!.content).toEqual('Standard invoice template content');
    expect(template2!.category).toEqual('billing');
    expect(template2!.id).toEqual('template-2');
    expect(template2!.createdAt).toBeInstanceOf(Date);
    expect(template2!.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle different template types correctly', async () => {
    // Create templates of different types
    await db.insert(resourceTemplatesTable)
      .values([
        {
          id: 'calc-1',
          name: 'Calculator Template',
          type: 'calculator',
          content: 'Calculator content',
          category: 'tools'
        },
        {
          id: 'doc-1',
          name: 'Document Template',
          type: 'document_template',
          content: 'Document content',
          category: 'forms'
        }
      ])
      .execute();

    const result = await getResourceTemplates();

    expect(result).toHaveLength(2);
    
    const calculatorTemplate = result.find(t => t.type === 'calculator');
    const documentTemplate = result.find(t => t.type === 'document_template');

    expect(calculatorTemplate).toBeDefined();
    expect(calculatorTemplate!.name).toEqual('Calculator Template');
    expect(calculatorTemplate!.category).toEqual('tools');

    expect(documentTemplate).toBeDefined();
    expect(documentTemplate!.name).toEqual('Document Template');
    expect(documentTemplate!.category).toEqual('forms');
  });
});
