
import { z } from 'zod';

// Enums
export const userRoleEnum = z.enum(['Guest', 'Client-User', 'Client-Admin', 'Firm-Accountant', 'System-Admin']);
export const organizationMemberRoleEnum = z.enum(['member', 'admin']);
export const requestStatusEnum = z.enum(['Open', 'In Progress', 'Completed', 'Closed']);
export const taskStatusEnum = z.enum(['Not Started', 'In Progress', 'Awaiting Client Feedback', 'Completed']);
export const taskPriorityEnum = z.enum(['High', 'Medium', 'Low']);
export const paymentStatusEnum = z.enum(['Draft', 'Sent', 'Paid', 'Overdue']);
export const resourceTemplateTypeEnum = z.enum(['document_template', 'calculator']);

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleEnum,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Account schema
export const accountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable()
});

export type Account = z.infer<typeof accountSchema>;

// Session schema
export const sessionSchema = z.object({
  id: z.string(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.coerce.date()
});

export type Session = z.infer<typeof sessionSchema>;

// Organization schema
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Organization = z.infer<typeof organizationSchema>;

// Organization Member schema
export const organizationMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  role: organizationMemberRoleEnum
});

export type OrganizationMember = z.infer<typeof organizationMemberSchema>;

// Request schema
export const requestSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  description: z.string(),
  status: requestStatusEnum,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Request = z.infer<typeof requestSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  title: z.string(),
  description: z.string(),
  status: taskStatusEnum,
  assigneeId: z.string().nullable(),
  priority: taskPriorityEnum,
  dueDate: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Document schema
export const documentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  requestId: z.string().nullable(),
  taskId: z.string().nullable(),
  uploaderId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Document = z.infer<typeof documentSchema>;

// Invoice schema
export const invoiceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  currency: z.string(),
  dueDate: z.coerce.date(),
  issueDate: z.coerce.date(),
  paymentStatus: paymentStatusEnum,
  paymentTransactionId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Chat History schema
export const chatHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  query: z.string(),
  response: z.string(),
  timestamp: z.coerce.date(),
  isGuest: z.boolean(),
  organizationId: z.string().nullable()
});

export type ChatHistory = z.infer<typeof chatHistorySchema>;

// Resource Template schema
export const resourceTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: resourceTemplateTypeEnum,
  content: z.string(),
  category: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type ResourceTemplate = z.infer<typeof resourceTemplateSchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role: userRoleEnum
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createOrganizationInputSchema = z.object({
  name: z.string()
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>;

export const createRequestInputSchema = z.object({
  organizationId: z.string(),
  title: z.string(),
  description: z.string()
});

export type CreateRequestInput = z.infer<typeof createRequestInputSchema>;

export const createTaskInputSchema = z.object({
  requestId: z.string(),
  title: z.string(),
  description: z.string(),
  assigneeId: z.string().nullable().optional(),
  priority: taskPriorityEnum,
  dueDate: z.coerce.date().nullable().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const createDocumentInputSchema = z.object({
  organizationId: z.string(),
  requestId: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  uploaderId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int()
});

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;

export const createInvoiceInputSchema = z.object({
  organizationId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  dueDate: z.coerce.date(),
  issueDate: z.coerce.date()
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceInputSchema>;

export const createChatHistoryInputSchema = z.object({
  userId: z.string(),
  query: z.string(),
  response: z.string(),
  isGuest: z.boolean(),
  organizationId: z.string().nullable().optional()
});

export type CreateChatHistoryInput = z.infer<typeof createChatHistoryInputSchema>;

export const createResourceTemplateInputSchema = z.object({
  name: z.string(),
  type: resourceTemplateTypeEnum,
  content: z.string(),
  category: z.string()
});

export type CreateResourceTemplateInput = z.infer<typeof createResourceTemplateInputSchema>;

// Update schemas
export const updateRequestInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: requestStatusEnum.optional()
});

export type UpdateRequestInput = z.infer<typeof updateRequestInputSchema>;

export const updateTaskInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  assigneeId: z.string().nullable().optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const updateInvoiceInputSchema = z.object({
  id: z.string(),
  paymentStatus: paymentStatusEnum.optional(),
  paymentTransactionId: z.string().nullable().optional()
});

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceInputSchema>;
