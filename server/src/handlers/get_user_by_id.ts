
import { type User } from '../schema';

export declare function getUserById(id: string): Promise<User | null>;
