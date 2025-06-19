
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatHistoryTable, usersTable, organizationsTable } from '../db/schema';
import { type CreateChatHistoryInput } from '../schema';
import { createChatHistory } from '../handlers/create_chat_history';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('createChatHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create chat history for guest user', async () => {
    // Create test user first
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'Guest'
    }).execute();

    const testInput: CreateChatHistoryInput = {
      userId: userId,
      query: 'What is the tax rate for small businesses?',
      response: 'The tax rate for small businesses varies by jurisdiction...',
      isGuest: true,
      organizationId: null
    };

    const result = await createChatHistory(testInput);

    // Basic field validation
    expect(result.userId).toEqual(userId);
    expect(result.query).toEqual('What is the tax rate for small businesses?');
    expect(result.response).toEqual('The tax rate for small businesses varies by jurisdiction...');
    expect(result.isGuest).toEqual(true);
    expect(result.organizationId).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should create chat history for organization member', async () => {
    // Create test user and organization first
    const userId = nanoid();
    const organizationId = nanoid();

    await db.insert(usersTable).values({
      id: userId,
      email: 'client@example.com',
      name: 'Client User',
      role: 'Client-User'
    }).execute();

    await db.insert(organizationsTable).values({
      id: organizationId,
      name: 'Test Organization'
    }).execute();

    const testInput: CreateChatHistoryInput = {
      userId: userId,
      query: 'Can you help me with quarterly tax filing?',
      response: 'I can help you with quarterly tax filing. Here are the steps...',
      isGuest: false,
      organizationId: organizationId
    };

    const result = await createChatHistory(testInput);

    // Basic field validation
    expect(result.userId).toEqual(userId);
    expect(result.query).toEqual('Can you help me with quarterly tax filing?');
    expect(result.response).toEqual('I can help you with quarterly tax filing. Here are the steps...');
    expect(result.isGuest).toEqual(false);
    expect(result.organizationId).toEqual(organizationId);
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should save chat history to database', async () => {
    // Create test user first
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'Guest'
    }).execute();

    const testInput: CreateChatHistoryInput = {
      userId: userId,
      query: 'Test query',
      response: 'Test response',
      isGuest: true
    };

    const result = await createChatHistory(testInput);

    // Query using proper drizzle syntax
    const chatHistories = await db.select()
      .from(chatHistoryTable)
      .where(eq(chatHistoryTable.id, result.id))
      .execute();

    expect(chatHistories).toHaveLength(1);
    expect(chatHistories[0].userId).toEqual(userId);
    expect(chatHistories[0].query).toEqual('Test query');
    expect(chatHistories[0].response).toEqual('Test response');
    expect(chatHistories[0].isGuest).toEqual(true);
    expect(chatHistories[0].organizationId).toBeNull();
    expect(chatHistories[0].timestamp).toBeInstanceOf(Date);
  });

  it('should handle missing optional organizationId', async () => {
    // Create test user first
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'Guest'
    }).execute();

    const testInput: CreateChatHistoryInput = {
      userId: userId,
      query: 'Test query without organization',
      response: 'Test response',
      isGuest: true
      // organizationId intentionally omitted
    };

    const result = await createChatHistory(testInput);

    expect(result.organizationId).toBeNull();
    expect(result.userId).toEqual(userId);
    expect(result.query).toEqual('Test query without organization');
    expect(result.isGuest).toEqual(true);
  });

  it('should throw error for non-existent user', async () => {
    const testInput: CreateChatHistoryInput = {
      userId: 'non-existent-user-id',
      query: 'Test query',
      response: 'Test response',
      isGuest: true
    };

    await expect(createChatHistory(testInput)).rejects.toThrow(/foreign key constraint/i);
  });

  it('should throw error for non-existent organization', async () => {
    // Create test user first
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'Client-User'
    }).execute();

    const testInput: CreateChatHistoryInput = {
      userId: userId,
      query: 'Test query',
      response: 'Test response',
      isGuest: false,
      organizationId: 'non-existent-org-id'
    };

    await expect(createChatHistory(testInput)).rejects.toThrow(/foreign key constraint/i);
  });
});
