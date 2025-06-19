
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { invoicesTable, organizationsTable } from '../db/schema';
import { type CreateInvoiceInput } from '../schema';
import { createInvoice } from '../handlers/create_invoice';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Test organization data
const testOrganization = {
  id: nanoid(),
  name: 'Test Organization'
};

// Test input data
const testInput: CreateInvoiceInput = {
  organizationId: testOrganization.id,
  invoiceNumber: 'INV-2024-001',
  amount: 1500.50,
  currency: 'USD',
  dueDate: new Date('2024-02-15'),
  issueDate: new Date('2024-01-15')
};

describe('createInvoice', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite organization
    await db.insert(organizationsTable)
      .values(testOrganization)
      .execute();
  });
  
  afterEach(resetDB);

  it('should create an invoice', async () => {
    const result = await createInvoice(testInput);

    // Basic field validation
    expect(result.organizationId).toEqual(testOrganization.id);
    expect(result.invoiceNumber).toEqual('INV-2024-001');
    expect(result.amount).toEqual(1500.50);
    expect(typeof result.amount).toBe('number');
    expect(result.currency).toEqual('USD');
    expect(result.dueDate).toEqual(testInput.dueDate);
    expect(result.issueDate).toEqual(testInput.issueDate);
    expect(result.paymentStatus).toEqual('Draft');
    expect(result.paymentTransactionId).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save invoice to database', async () => {
    const result = await createInvoice(testInput);

    // Query database to verify invoice was saved
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, result.id))
      .execute();

    expect(invoices).toHaveLength(1);
    const savedInvoice = invoices[0];
    expect(savedInvoice.organizationId).toEqual(testOrganization.id);
    expect(savedInvoice.invoiceNumber).toEqual('INV-2024-001');
    expect(parseFloat(savedInvoice.amount)).toEqual(1500.50);
    expect(savedInvoice.currency).toEqual('USD');
    expect(savedInvoice.dueDate).toEqual(testInput.dueDate);
    expect(savedInvoice.issueDate).toEqual(testInput.issueDate);
    expect(savedInvoice.paymentStatus).toEqual('Draft');
    expect(savedInvoice.createdAt).toBeInstanceOf(Date);
    expect(savedInvoice.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle decimal amounts correctly', async () => {
    const decimalInput: CreateInvoiceInput = {
      ...testInput,
      amount: 999.99,
      invoiceNumber: 'INV-2024-002'
    };

    const result = await createInvoice(decimalInput);

    expect(result.amount).toEqual(999.99);
    expect(typeof result.amount).toBe('number');

    // Verify in database
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, result.id))
      .execute();

    expect(parseFloat(invoices[0].amount)).toEqual(999.99);
  });

  it('should fail with invalid organization id', async () => {
    const invalidInput: CreateInvoiceInput = {
      ...testInput,
      organizationId: 'non-existent-org-id'
    };

    await expect(createInvoice(invalidInput)).rejects.toThrow(/foreign key constraint/i);
  });

  it('should fail with duplicate invoice number', async () => {
    // Create first invoice
    await createInvoice(testInput);

    // Try to create another invoice with same invoice number
    const duplicateInput: CreateInvoiceInput = {
      ...testInput,
      amount: 2000.00
    };

    await expect(createInvoice(duplicateInput)).rejects.toThrow(/unique constraint/i);
  });
});
