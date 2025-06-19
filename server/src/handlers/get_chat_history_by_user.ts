
import { db } from '../db';
import { chatHistoryTable } from '../db/schema';
import { type ChatHistory } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getChatHistoryByUser = async (userId: string): Promise<ChatHistory[]> => {
  try {
    const results = await db.select()
      .from(chatHistoryTable)
      .where(eq(chatHistoryTable.userId, userId))
      .orderBy(desc(chatHistoryTable.timestamp))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get chat history by user:', error);
    throw error;
  }
};
