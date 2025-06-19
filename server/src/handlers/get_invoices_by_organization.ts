
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type Invoice } from '../schema';
import { eq } from 'drizzle-orm';

export const getInvoicesByOrganization = async (organizationId: string): Promise<Invoice[]> => {
  try {
    const results = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.organizationId, organizationId))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(invoice => ({
      ...invoice,
      amount: parseFloat(invoice.amount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch invoices by organization:', error);
    throw error;
  }
};
