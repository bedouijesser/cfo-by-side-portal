
import { text, pgTable, timestamp, boolean, integer, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['Guest', 'Client-User', 'Client-Admin', 'Firm-Accountant', 'System-Admin']);
export const organizationMemberRoleEnum = pgEnum('organization_member_role', ['member', 'admin']);
export const requestStatusEnum = pgEnum('request_status', ['Open', 'In Progress', 'Completed', 'Closed']);
export const taskStatusEnum = pgEnum('task_status', ['Not Started', 'In Progress', 'Awaiting Client Feedback', 'Completed']);
export const taskPriorityEnum = pgEnum('task_priority', ['High', 'Medium', 'Low']);
export const paymentStatusEnum = pgEnum('payment_status', ['Draft', 'Sent', 'Paid', 'Overdue']);
export const resourceTemplateTypeEnum = pgEnum('resource_template_type', ['document_template', 'calculator']);

// Users table
export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Accounts table (for authentication providers)
export const accountsTable = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state')
});

// Sessions table
export const sessionsTable = pgTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull()
});

// Organizations table
export const organizationsTable = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Organization members table
export const organizationMembersTable = pgTable('organization_members', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
  role: organizationMemberRoleEnum('role').notNull()
});

// Requests table
export const requestsTable = pgTable('requests', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: requestStatusEnum('status').notNull().default('Open'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tasks table
export const tasksTable = pgTable('tasks', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => requestsTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: taskStatusEnum('status').notNull().default('Not Started'),
  assigneeId: text('assignee_id').references(() => usersTable.id),
  priority: taskPriorityEnum('priority').notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Documents table
export const documentsTable = pgTable('documents', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
  requestId: text('request_id').references(() => requestsTable.id),
  taskId: text('task_id').references(() => tasksTable.id),
  uploaderId: text('uploader_id').notNull().references(() => usersTable.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Invoices table
export const invoicesTable = pgTable('invoices', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull(),
  dueDate: timestamp('due_date').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('Draft'),
  paymentTransactionId: text('payment_transaction_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Chat history table
export const chatHistoryTable = pgTable('chat_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  response: text('response').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  isGuest: boolean('is_guest').notNull(),
  organizationId: text('organization_id').references(() => organizationsTable.id)
});

// Resource templates table
export const resourceTemplatesTable = pgTable('resource_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: resourceTemplateTypeEnum('type').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  accounts: many(accountsTable),
  sessions: many(sessionsTable),
  organizationMemberships: many(organizationMembersTable),
  assignedTasks: many(tasksTable),
  uploadedDocuments: many(documentsTable),
  chatHistory: many(chatHistoryTable)
}));

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id]
  })
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id]
  })
}));

export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  members: many(organizationMembersTable),
  requests: many(requestsTable),
  documents: many(documentsTable),
  invoices: many(invoicesTable),
  chatHistory: many(chatHistoryTable)
}));

export const organizationMembersRelations = relations(organizationMembersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [organizationMembersTable.userId],
    references: [usersTable.id]
  }),
  organization: one(organizationsTable, {
    fields: [organizationMembersTable.organizationId],
    references: [organizationsTable.id]
  })
}));

export const requestsRelations = relations(requestsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [requestsTable.organizationId],
    references: [organizationsTable.id]
  }),
  tasks: many(tasksTable),
  documents: many(documentsTable)
}));

export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  request: one(requestsTable, {
    fields: [tasksTable.requestId],
    references: [requestsTable.id]
  }),
  assignee: one(usersTable, {
    fields: [tasksTable.assigneeId],
    references: [usersTable.id]
  }),
  documents: many(documentsTable)
}));

export const documentsRelations = relations(documentsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [documentsTable.organizationId],
    references: [organizationsTable.id]
  }),
  request: one(requestsTable, {
    fields: [documentsTable.requestId],
    references: [requestsTable.id]
  }),
  task: one(tasksTable, {
    fields: [documentsTable.taskId],
    references: [tasksTable.id]
  }),
  uploader: one(usersTable, {
    fields: [documentsTable.uploaderId],
    references: [usersTable.id]
  })
}));

export const invoicesRelations = relations(invoicesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [invoicesTable.organizationId],
    references: [organizationsTable.id]
  })
}));

export const chatHistoryRelations = relations(chatHistoryTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [chatHistoryTable.userId],
    references: [usersTable.id]
  }),
  organization: one(organizationsTable, {
    fields: [chatHistoryTable.organizationId],
    references: [organizationsTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  accounts: accountsTable,
  sessions: sessionsTable,
  organizations: organizationsTable,
  organizationMembers: organizationMembersTable,
  requests: requestsTable,
  tasks: tasksTable,
  documents: documentsTable,
  invoices: invoicesTable,
  chatHistory: chatHistoryTable,
  resourceTemplates: resourceTemplatesTable
};
