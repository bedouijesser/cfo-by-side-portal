
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, chatHistoryTable, organizationsTable } from '../db/schema';
import { type CreateUserInput, type CreateChatHistoryInput, type CreateOrganizationInput } from '../schema';
import { getChatHistoryByUser } from '../handlers/get_chat_history_by_user';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'Client-User'
};

const testOrganization: CreateOrganizationInput = {
  name: 'Test Organization'
};

describe('getChatHistoryByUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return chat history for specific user', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values([
      { id: 'user-1', ...testUser },
      { id: 'user-2', ...testUser, email: 'user2@example.com', name: 'User 2' }
    ]).execute();

    await db.insert(organizationsTable).values({
      id: 'org-1',
      ...testOrganization
    }).execute();

    // Create chat history records
    const testChatHistory1: CreateChatHistoryInput = {
      userId: 'user-1',
      query: 'What are the tax implications?',
      response: 'Tax implications depend on your specific situation...',
      isGuest: false,
      organizationId: 'org-1'
    };

    const testChatHistory2: CreateChatHistoryInput = {
      userId: 'user-1',
      query: 'How do I file quarterly taxes?',
      response: 'Quarterly taxes should be filed using Form 1040ES...',
      isGuest: false,
      organizationId: null
    };

    const testChatHistory3: CreateChatHistoryInput = {
      userId: 'user-2',
      query: 'Different user query',
      response: 'Different user response',
      isGuest: true,
      organizationId: null
    };

    await db.insert(chatHistoryTable).values([
      { id: 'chat-1', ...testChatHistory1 },
      { id: 'chat-2', ...testChatHistory2 },
      { id: 'chat-3', ...testChatHistory3 }
    ]).execute();

    const result = await getChatHistoryByUser('user-1');

    expect(result).toHaveLength(2);
    
    // Check that only user-1's chat history is returned
    result.forEach(chat => {
      expect(chat.userId).toEqual('user-1');
    });

    // Check specific chat history content
    const queries = result.map(chat => chat.query);
    expect(queries).toContain('What are the tax implications?');
    expect(queries).toContain('How do I file quarterly taxes?');
    expect(queries).not.toContain('Different user query');
  });

  it('should return empty array for user with no chat history', async () => {
    // Create user but no chat history
    await db.insert(usersTable).values({
      id: 'user-1',
      ...testUser
    }).execute();

    const result = await getChatHistoryByUser('user-1');

    expect(result).toHaveLength(0);
  });

  it('should return results ordered by timestamp descending', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user-1',
      ...testUser
    }).execute();

    // Create chat history with different timestamps - no organization references
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    await db.insert(chatHistoryTable).values([
      { 
        id: 'chat-1', 
        userId: 'user-1',
        query: 'First query',
        response: 'First response',
        isGuest: false,
        organizationId: null,
        timestamp: twoHoursAgo
      },
      { 
        id: 'chat-2', 
        userId: 'user-1',
        query: 'Second query',
        response: 'Second response',
        isGuest: false,
        organizationId: null,
        timestamp: now
      },
      { 
        id: 'chat-3', 
        userId: 'user-1',
        query: 'Third query',
        response: 'Third response',
        isGuest: false,
        organizationId: null,
        timestamp: oneHourAgo
      }
    ]).execute();

    const result = await getChatHistoryByUser('user-1');

    expect(result).toHaveLength(3);
    
    // Check ordering - most recent first
    expect(result[0].query).toEqual('Second query');
    expect(result[1].query).toEqual('Third query');
    expect(result[2].query).toEqual('First query');

    // Verify timestamps are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].timestamp.getTime()).toBeGreaterThanOrEqual(
        result[i + 1].timestamp.getTime()
      );
    }
  });

  it('should handle both guest and non-guest chat history', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user-1',
      ...testUser
    }).execute();

    // Create chat history with different guest statuses - no organization references
    await db.insert(chatHistoryTable).values([
      { 
        id: 'chat-1', 
        userId: 'user-1',
        query: 'Guest query',
        response: 'Guest response',
        isGuest: true,
        organizationId: null
      },
      { 
        id: 'chat-2', 
        userId: 'user-1',
        query: 'Non-guest query',
        response: 'Non-guest response',
        isGuest: false,
        organizationId: null
      }
    ]).execute();

    const result = await getChatHistoryByUser('user-1');

    expect(result).toHaveLength(2);
    
    const guestStatuses = result.map(chat => chat.isGuest);
    expect(guestStatuses).toContain(true);
    expect(guestStatuses).toContain(false);
  });
});
