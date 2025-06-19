
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { resourceTemplatesTable } from '../db/schema';
import { type CreateResourceTemplateInput } from '../schema';
import { getResourceTemplatesByType } from '../handlers/get_resource_templates_by_type';

// Test data
const documentTemplate: CreateResourceTemplateInput = {
  name: 'Tax Form Template',
  type: 'document_template',
  content: '<!DOCTYPE html><html><body>Tax Form</body></html>',
  category: 'taxes'
};

const calculatorTemplate: CreateResourceTemplateInput = {
  name: 'Mortgage Calculator',
  type: 'calculator',
  content: 'function calculateMortgage() { return 0; }',
  category: 'finance'
};

const anotherDocumentTemplate: CreateResourceTemplateInput = {
  name: 'Invoice Template',
  type: 'document_template',
  content: '<!DOCTYPE html><html><body>Invoice</body></html>',
  category: 'billing'
};

describe('getResourceTemplatesByType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no templates exist', async () => {
    const result = await getResourceTemplatesByType('document_template');
    expect(result).toEqual([]);
  });

  it('should return document templates only', async () => {
    // Create test data
    await db.insert(resourceTemplatesTable).values([
      { id: '1', ...documentTemplate },
      { id: '2', ...calculatorTemplate },
      { id: '3', ...anotherDocumentTemplate }
    ]).execute();

    const result = await getResourceTemplatesByType('document_template');

    expect(result).toHaveLength(2);
    expect(result.every(template => template.type === 'document_template')).toBe(true);
    
    const names = result.map(t => t.name).sort();
    expect(names).toEqual(['Invoice Template', 'Tax Form Template']);
  });

  it('should return calculator templates only', async () => {
    // Create test data
    await db.insert(resourceTemplatesTable).values([
      { id: '1', ...documentTemplate },
      { id: '2', ...calculatorTemplate },
      { id: '3', ...anotherDocumentTemplate }
    ]).execute();

    const result = await getResourceTemplatesByType('calculator');

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('calculator');
    expect(result[0].name).toBe('Mortgage Calculator');
    expect(result[0].category).toBe('finance');
    expect(result[0].content).toBe('function calculateMortgage() { return 0; }');
  });

  it('should return templates with all required fields', async () => {
    await db.insert(resourceTemplatesTable).values([
      { id: '1', ...documentTemplate }
    ]).execute();

    const result = await getResourceTemplatesByType('document_template');

    expect(result).toHaveLength(1);
    const template = result[0];
    
    expect(template.id).toBeDefined();
    expect(template.name).toBe('Tax Form Template');
    expect(template.type).toBe('document_template');
    expect(template.content).toBe('<!DOCTYPE html><html><body>Tax Form</body></html>');
    expect(template.category).toBe('taxes');
    expect(template.createdAt).toBeInstanceOf(Date);
    expect(template.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle mixed categories for same type', async () => {
    const template1: CreateResourceTemplateInput = {
      name: 'W-2 Template',
      type: 'document_template',
      content: '<html>W-2 Form</html>',
      category: 'payroll'
    };

    const template2: CreateResourceTemplateInput = {
      name: '1099 Template',
      type: 'document_template',
      content: '<html>1099 Form</html>',
      category: 'taxes'
    };

    await db.insert(resourceTemplatesTable).values([
      { id: '1', ...template1 },
      { id: '2', ...template2 }
    ]).execute();

    const result = await getResourceTemplatesByType('document_template');

    expect(result).toHaveLength(2);
    expect(result.every(template => template.type === 'document_template')).toBe(true);
    
    const categories = result.map(t => t.category).sort();
    expect(categories).toEqual(['payroll', 'taxes']);
  });
});
