
import { type ChatHistory } from '../schema';

export declare function getChatHistoryByUser(userId: string): Promise<ChatHistory[]>;
