
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { invoicesTable, organizationsTable } from '../db/schema';
import { type UpdateInvoiceInput, type CreateOrganizationInput, type CreateInvoiceInput } from '../schema';
import { updateInvoice } from '../handlers/update_invoice';
import { eq } from 'drizzle-orm';

// Helper function to create organization
const createTestOrganization = async (input: CreateOrganizationInput) => {
  const result = await db.insert(organizationsTable)
    .values({
      id: 'org-' + Math.random().toString(36).substring(7),
      name: input.name
    })
    .returning()
    .execute();

  return result[0];
};

// Helper function to create invoice
const createTestInvoice = async (input: CreateInvoiceInput) => {
  const result = await db.insert(invoicesTable)
    .values({
      id: 'inv-' + Math.random().toString(36).substring(7),
      organizationId: input.organizationId,
      invoiceNumber: input.invoiceNumber,
      amount: input.amount.toString(), // Convert number to string for numeric column
      currency: input.currency,
      dueDate: input.dueDate,
      issueDate: input.issueDate,
      paymentStatus: 'Draft' // Default status
    })
    .returning()
    .execute();

  const invoice = result[0];
  return {
    ...invoice,
    amount: parseFloat(invoice.amount) // Convert string back to number
  };
};

describe('updateInvoice', () => {
  let testOrganization: any;
  let testInvoice: any;

  beforeEach(async () => {
    await createDB();
    
    // Create test organization
    testOrganization = await createTestOrganization({
      name: 'Test Organization'
    });

    // Create test invoice
    testInvoice = await createTestInvoice({
      organizationId: testOrganization.id,
      invoiceNumber: 'INV-001',
      amount: 100.50,
      currency: 'USD',
      dueDate: new Date('2024-02-01'),
      issueDate: new Date('2024-01-01')
    });
  });

  afterEach(resetDB);

  it('should update invoice payment status', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: testInvoice.id,
      paymentStatus: 'Paid'
    };

    const result = await updateInvoice(updateInput);

    expect(result.id).toEqual(testInvoice.id);
    expect(result.paymentStatus).toEqual('Paid');
    expect(result.amount).toEqual(100.50);
    expect(typeof result.amount).toBe('number');
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update invoice payment transaction ID', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: testInvoice.id,
      paymentTransactionId: 'txn_123456'
    };

    const result = await updateInvoice(updateInput);

    expect(result.id).toEqual(testInvoice.id);
    expect(result.paymentTransactionId).toEqual('txn_123456');
    expect(result.paymentStatus).toEqual('Draft'); // Should remain unchanged
    expect(result.amount).toEqual(100.50);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should update both payment status and transaction ID', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: testInvoice.id,
      paymentStatus: 'Paid',
      paymentTransactionId: 'txn_789012'
    };

    const result = await updateInvoice(updateInput);

    expect(result.id).toEqual(testInvoice.id);
    expect(result.paymentStatus).toEqual('Paid');
    expect(result.paymentTransactionId).toEqual('txn_789012');
    expect(result.amount).toEqual(100.50);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should clear payment transaction ID when set to null', async () => {
    // First set a transaction ID
    await updateInvoice({
      id: testInvoice.id,
      paymentTransactionId: 'txn_to_clear'
    });

    // Then clear it
    const updateInput: UpdateInvoiceInput = {
      id: testInvoice.id,
      paymentTransactionId: null
    };

    const result = await updateInvoice(updateInput);

    expect(result.id).toEqual(testInvoice.id);
    expect(result.paymentTransactionId).toBeNull();
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: testInvoice.id,
      paymentStatus: 'Overdue',
      paymentTransactionId: 'txn_overdue'
    };

    await updateInvoice(updateInput);

    // Query database directly to verify changes
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, testInvoice.id))
      .execute();

    expect(invoices).toHaveLength(1);
    expect(invoices[0].paymentStatus).toEqual('Overdue');
    expect(invoices[0].paymentTransactionId).toEqual('txn_overdue');
    expect(parseFloat(invoices[0].amount)).toEqual(100.50);
    expect(invoices[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent invoice', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: 'non-existent-id',
      paymentStatus: 'Paid'
    };

    await expect(updateInvoice(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve unchanged fields', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: testInvoice.id,
      paymentStatus: 'Sent'
    };

    const result = await updateInvoice(updateInput);

    // Verify unchanged fields remain the same
    expect(result.organizationId).toEqual(testInvoice.organizationId);
    expect(result.invoiceNumber).toEqual(testInvoice.invoiceNumber);
    expect(result.amount).toEqual(testInvoice.amount);
    expect(result.currency).toEqual(testInvoice.currency);
    expect(result.dueDate).toEqual(testInvoice.dueDate);
    expect(result.issueDate).toEqual(testInvoice.issueDate);
    expect(result.createdAt).toEqual(testInvoice.createdAt);

    // Verify changed fields
    expect(result.paymentStatus).toEqual('Sent');
    expect(result.updatedAt).not.toEqual(testInvoice.updatedAt);
  });
});
