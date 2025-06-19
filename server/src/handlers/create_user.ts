
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';
import { nanoid } from 'nanoid';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        id: nanoid(),
        email: input.email,
        name: input.name,
        role: input.role
      })
      .returning()
      .execute();

    // Return the created user
    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};
