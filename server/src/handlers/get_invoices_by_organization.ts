
import { type Invoice } from '../schema';

export declare function getInvoicesByOrganization(organizationId: string): Promise<Invoice[]>;
