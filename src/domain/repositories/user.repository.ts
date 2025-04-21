import type { User, UserIdentifier } from "@domain/entities";

export interface UserRepository {
  // Create
  newUser(user: User): Promise<void>;

  // Check
  isAvailable(
    check: Partial<UserIdentifier>,
  ): Promise<undefined | "email" | "identity_id">;
  isEmailVerified(id: string): Promise<boolean>;
  isTwoFactorEnabled(id: string): Promise<boolean>;

  // Read
  getUserById<T>(id: string, which?: T): Promise<T>;
  getUserByIdentityId<T>(identityId: string, which?: T): Promise<T>;
  getUserByEmail<T>(email: string, which?: T): Promise<T>;
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
