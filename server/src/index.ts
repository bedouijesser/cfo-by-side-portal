
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  createOrganizationInputSchema,
  createRequestInputSchema,
  updateRequestInputSchema,
  createTaskInputSchema,
  updateTaskInputSchema,
  createDocumentInputSchema,
  createInvoiceInputSchema,
  updateInvoiceInputSchema,
  createChatHistoryInputSchema,
  createResourceTemplateInputSchema,
  resourceTemplateTypeEnum
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { getUserById } from './handlers/get_user_by_id';
import { createOrganization } from './handlers/create_organization';
import { getOrganizations } from './handlers/get_organizations';
import { getOrganizationById } from './handlers/get_organization_by_id';
import { createRequest } from './handlers/create_request';
import { getRequests } from './handlers/get_requests';
import { getRequestsByOrganization } from './handlers/get_requests_by_organization';
import { updateRequest } from './handlers/update_request';
import { createTask } from './handlers/create_task';
import { getTasksByRequest } from './handlers/get_tasks_by_request';
import { updateTask } from './handlers/update_task';
import { createDocument } from './handlers/create_document';
import { getDocumentsByOrganization } from './handlers/get_documents_by_organization';
import { createInvoice } from './handlers/create_invoice';
import { getInvoicesByOrganization } from './handlers/get_invoices_by_organization';
import { updateInvoice } from './handlers/update_invoice';
import { createChatHistory } from './handlers/create_chat_history';
import { getChatHistoryByUser } from './handlers/get_chat_history_by_user';
import { createResourceTemplate } from './handlers/create_resource_template';
import { getResourceTemplates } from './handlers/get_resource_templates';
import { getResourceTemplatesByType } from './handlers/get_resource_templates_by_type';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  getUsers: publicProcedure
    .query(() => getUsers()),
  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getUserById(input.id)),

  // Organization routes
  createOrganization: publicProcedure
    .input(createOrganizationInputSchema)
    .mutation(({ input }) => createOrganization(input)),
  getOrganizations: publicProcedure
    .query(() => getOrganizations()),
  getOrganizationById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getOrganizationById(input.id)),

  // Request routes
  createRequest: publicProcedure
    .input(createRequestInputSchema)
    .mutation(({ input }) => createRequest(input)),
  getRequests: publicProcedure
    .query(() => getRequests()),
  getRequestsByOrganization: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(({ input }) => getRequestsByOrganization(input.organizationId)),
  updateRequest: publicProcedure
    .input(updateRequestInputSchema)
    .mutation(({ input }) => updateRequest(input)),

  // Task routes
  createTask: publicProcedure
    .input(createTaskInputSchema)
    .mutation(({ input }) => createTask(input)),
  getTasksByRequest: publicProcedure
    .input(z.object({ requestId: z.string() }))
    .query(({ input }) => getTasksByRequest(input.requestId)),
  updateTask: publicProcedure
    .input(updateTaskInputSchema)
    .mutation(({ input }) => updateTask(input)),

  // Document routes
  createDocument: publicProcedure
    .input(createDocumentInputSchema)
    .mutation(({ input }) => createDocument(input)),
  getDocumentsByOrganization: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(({ input }) => getDocumentsByOrganization(input.organizationId)),

  // Invoice routes
  createInvoice: publicProcedure
    .input(createInvoiceInputSchema)
    .mutation(({ input }) => createInvoice(input)),
  getInvoicesByOrganization: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(({ input }) => getInvoicesByOrganization(input.organizationId)),
  updateInvoice: publicProcedure
    .input(updateInvoiceInputSchema)
    .mutation(({ input }) => updateInvoice(input)),

  // Chat history routes
  createChatHistory: publicProcedure
    .input(createChatHistoryInputSchema)
    .mutation(({ input }) => createChatHistory(input)),
  getChatHistoryByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => getChatHistoryByUser(input.userId)),

  // Resource template routes
  createResourceTemplate: publicProcedure
    .input(createResourceTemplateInputSchema)
    .mutation(({ input }) => createResourceTemplate(input)),
  getResourceTemplates: publicProcedure
    .query(() => getResourceTemplates()),
  
  getResourceTemplatesByType: publicProcedure
    .input(z.object({ type: resourceTemplateTypeEnum }))
    .query(({ input }) => getResourceTemplatesByType(input.type)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`CFO-BY-SIDE TRPC server listening at port: ${port}`);
}

start();
