
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type UpdateInvoiceInput, type Invoice } from '../schema';
import { eq } from 'drizzle-orm';

export const updateInvoice = async (input: UpdateInvoiceInput): Promise<Invoice> => {
  try {
    // Build update values object with proper typing
    const updateValues: Partial<typeof invoicesTable.$inferInsert> = {
      updatedAt: new Date()
    };

    if (input.paymentStatus !== undefined) {
      updateValues.paymentStatus = input.paymentStatus;
    }

    if (input.paymentTransactionId !== undefined) {
      updateValues.paymentTransactionId = input.paymentTransactionId;
    }

    // Update invoice record
    const result = await db.update(invoicesTable)
      .set(updateValues)
      .where(eq(invoicesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Invoice with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const invoice = result[0];
    return {
      ...invoice,
      amount: parseFloat(invoice.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Invoice update failed:', error);
    throw error;
  }
};
