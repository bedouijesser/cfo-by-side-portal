
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type CreateInvoiceInput, type Invoice } from '../schema';
import { nanoid } from 'nanoid';

export const createInvoice = async (input: CreateInvoiceInput): Promise<Invoice> => {
  try {
    // Insert invoice record
    const result = await db.insert(invoicesTable)
      .values({
        id: nanoid(),
        organizationId: input.organizationId,
        invoiceNumber: input.invoiceNumber,
        amount: input.amount.toString(), // Convert number to string for numeric column
        currency: input.currency,
        dueDate: input.dueDate,
        issueDate: input.issueDate,
        paymentStatus: 'Draft', // Default status
        paymentTransactionId: null
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const invoice = result[0];
    return {
      ...invoice,
      amount: parseFloat(invoice.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Invoice creation failed:', error);
    throw error;
  }
};
