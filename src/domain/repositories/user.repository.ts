import type { UserIdentifier } from "@domain/entities";

export interface UserRepository {
  // Create
  save(user: UserIdentifier): Promise<void>;

  // Check
  isAvailable(email: string): Promise<boolean>;
  isEmailVerified(id: string): Promise<boolean>;
  isTwoFactorEnabled(id: string): Promise<boolean>;

  // Read
  getUserById(id: string): Promise<UserIdentifier>;
  getUserByEmail(email: string): Promise<UserIdentifier>;
  getTwoFactorSecret(id: string): Promise<string>;

  // Update
  changeEmail(id: string, email: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  changePhone(id: string, phone: string): Promise<void>;
  saveTwoFactorSecret(id: string, secret: string): Promise<void>;
  verifyEmail(id: string): Promise<void>;

  // Delete
  deleteAccount(id: string): Promise<void>;
}
