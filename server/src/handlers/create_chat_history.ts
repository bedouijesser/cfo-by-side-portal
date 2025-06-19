
import { db } from '../db';
import { chatHistoryTable } from '../db/schema';
import { type CreateChatHistoryInput, type ChatHistory } from '../schema';
import { nanoid } from 'nanoid';

export const createChatHistory = async (input: CreateChatHistoryInput): Promise<ChatHistory> => {
  try {
    // Insert chat history record
    const result = await db.insert(chatHistoryTable)
      .values({
        id: nanoid(),
        userId: input.userId,
        query: input.query,
        response: input.response,
        isGuest: input.isGuest,
        organizationId: input.organizationId || null
      })
      .returning()
      .execute();

    const chatHistory = result[0];
    return {
      id: chatHistory.id,
      userId: chatHistory.userId,
      query: chatHistory.query,
      response: chatHistory.response,
      timestamp: chatHistory.timestamp,
      isGuest: chatHistory.isGuest,
      organizationId: chatHistory.organizationId
    };
  } catch (error) {
    console.error('Chat history creation failed:', error);
    throw error;
  }
};
