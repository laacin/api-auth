import type { User, UserIdentifier } from "@domain/entities";

export interface UserRepository {
  // Create
  saveUser(user: User): Promise<void>;

  // Check
  isAvailable(
    check: Partial<UserIdentifier>,
  ): Promise<undefined | "email" | "identity_number">;
  isEmailVerified(id: string): Promise<boolean>;
  isTwoFactorEnabled(id: string): Promise<boolean>;

  // Read
  getUserById(id: string): Promise<User | undefined>;
  getUserById<K extends keyof User>(
    id: string,
    ...which: K[]
  ): Promise<Pick<User, K> | undefined>;

  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByEmail<K extends keyof User>(
    email: string,
    ...which: K[]
  ): Promise<Pick<User, K> | undefined>;

  getUserByIdentityNumber(identityNumber: string): Promise<User | undefined>;
  getUserByIdentityNumber<K extends keyof User>(
    identityNumber: string,
    ...which: K[]
  ): Promise<Pick<User, K> | undefined>;

  getTwoFactorSecret(id: string): Promise<string>;

  // Update
  changeEmail(id: string, email: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  saveTwoFactorSecret(id: string, secret: string): Promise<void>;
  verifyEmail(id: string): Promise<void>;
  newLogin(id: string, time: Date): Promise<void>;

  // Delete
  deleteAccount(id: string): Promise<void>;
}
