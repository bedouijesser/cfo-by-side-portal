
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { organizationsTable, invoicesTable } from '../db/schema';
import { type CreateOrganizationInput, type CreateInvoiceInput } from '../schema';
import { getInvoicesByOrganization } from '../handlers/get_invoices_by_organization';

// Test data
const testOrganization: CreateOrganizationInput = {
  name: 'Test Organization'
};

const testInvoice1: CreateInvoiceInput = {
  organizationId: 'org-1',
  invoiceNumber: 'INV-001',
  amount: 1500.50,
  currency: 'USD',
  dueDate: new Date('2024-12-31'),
  issueDate: new Date('2024-01-01')
};

const testInvoice2: CreateInvoiceInput = {
  organizationId: 'org-1',
  invoiceNumber: 'INV-002',
  amount: 2750.25,
  currency: 'USD',
  dueDate: new Date('2024-12-15'),
  issueDate: new Date('2024-01-15')
};

const testInvoice3: CreateInvoiceInput = {
  organizationId: 'org-2',
  invoiceNumber: 'INV-003',
  amount: 500.00,
  currency: 'USD',
  dueDate: new Date('2024-11-30'),
  issueDate: new Date('2024-01-30')
};

describe('getInvoicesByOrganization', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return invoices for the specified organization', async () => {
    // Create organizations
    await db.insert(organizationsTable).values([
      { id: 'org-1', name: testOrganization.name },
      { id: 'org-2', name: 'Another Organization' }
    ]).execute();

    // Create invoices
    await db.insert(invoicesTable).values([
      {
        id: 'invoice-1',
        organizationId: testInvoice1.organizationId,
        invoiceNumber: testInvoice1.invoiceNumber,
        amount: testInvoice1.amount.toString(),
        currency: testInvoice1.currency,
        dueDate: testInvoice1.dueDate,
        issueDate: testInvoice1.issueDate
      },
      {
        id: 'invoice-2',
        organizationId: testInvoice2.organizationId,
        invoiceNumber: testInvoice2.invoiceNumber,
        amount: testInvoice2.amount.toString(),
        currency: testInvoice2.currency,
        dueDate: testInvoice2.dueDate,
        issueDate: testInvoice2.issueDate
      },
      {
        id: 'invoice-3',
        organizationId: testInvoice3.organizationId,
        invoiceNumber: testInvoice3.invoiceNumber,
        amount: testInvoice3.amount.toString(),
        currency: testInvoice3.currency,
        dueDate: testInvoice3.dueDate,
        issueDate: testInvoice3.issueDate
      }
    ]).execute();

    const result = await getInvoicesByOrganization('org-1');

    expect(result).toHaveLength(2);
    
    // Check first invoice
    const invoice1 = result.find(inv => inv.invoiceNumber === 'INV-001');
    expect(invoice1).toBeDefined();
    expect(invoice1!.organizationId).toEqual('org-1');
    expect(invoice1!.amount).toEqual(1500.50);
    expect(typeof invoice1!.amount).toBe('number');
    expect(invoice1!.currency).toEqual('USD');
    expect(invoice1!.paymentStatus).toEqual('Draft');

    // Check second invoice
    const invoice2 = result.find(inv => inv.invoiceNumber === 'INV-002');
    expect(invoice2).toBeDefined();
    expect(invoice2!.organizationId).toEqual('org-1');
    expect(invoice2!.amount).toEqual(2750.25);
    expect(typeof invoice2!.amount).toBe('number');
    expect(invoice2!.currency).toEqual('USD');
    expect(invoice2!.paymentStatus).toEqual('Draft');

    // Ensure invoice from other organization is not included
    const invoice3 = result.find(inv => inv.invoiceNumber === 'INV-003');
    expect(invoice3).toBeUndefined();
  });

  it('should return empty array for organization with no invoices', async () => {
    // Create organization
    await db.insert(organizationsTable).values([
      { id: 'org-empty', name: 'Empty Organization' }
    ]).execute();

    const result = await getInvoicesByOrganization('org-empty');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent organization', async () => {
    const result = await getInvoicesByOrganization('non-existent-org');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle invoices with different payment statuses', async () => {
    // Create organization
    await db.insert(organizationsTable).values([
      { id: 'org-status', name: 'Status Test Organization' }
    ]).execute();

    // Create invoices with different statuses
    await db.insert(invoicesTable).values([
      {
        id: 'invoice-draft',
        organizationId: 'org-status',
        invoiceNumber: 'INV-DRAFT',
        amount: '100.00',
        currency: 'USD',
        dueDate: new Date('2024-12-31'),
        issueDate: new Date('2024-01-01'),
        paymentStatus: 'Draft'
      },
      {
        id: 'invoice-paid',
        organizationId: 'org-status',
        invoiceNumber: 'INV-PAID',
        amount: '200.00',
        currency: 'USD',
        dueDate: new Date('2024-12-31'),
        issueDate: new Date('2024-01-01'),
        paymentStatus: 'Paid',
        paymentTransactionId: 'txn-123'
      }
    ]).execute();

    const result = await getInvoicesByOrganization('org-status');

    expect(result).toHaveLength(2);
    
    const draftInvoice = result.find(inv => inv.invoiceNumber === 'INV-DRAFT');
    expect(draftInvoice!.paymentStatus).toEqual('Draft');
    expect(draftInvoice!.paymentTransactionId).toBeNull();

    const paidInvoice = result.find(inv => inv.invoiceNumber === 'INV-PAID');
    expect(paidInvoice!.paymentStatus).toEqual('Paid');
    expect(paidInvoice!.paymentTransactionId).toEqual('txn-123');
  });
});
