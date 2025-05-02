import type { User, UserIdentifier } from "@domain/entities/user";

export interface UserRepository {
  // Create
  saveUser(user: User): Promise<void>;

  // Check
  isAvailable(
    check: Partial<UserIdentifier>,
  ): Promise<undefined | "email" | "identity_number">;

  // Read
  getUser(identifier: {
    id?: string;
    email?: string;
    identityNumber?: string;
  }): Promise<User | undefined>;
  getUser<K extends keyof User>(
    identifier: {
      id?: string;
      email?: string;
      identityNumber?: string;
    },
    ...which: K[]
  ): Promise<Pick<User, K> | undefined>;

  // Update
  updateMany(id: string, user: Partial<User>): Promise<void>;
  changeEmail(id: string, email: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  activeTwoFactor(id: string): Promise<void>;
  saveTwoFactorSecret(id: string, secret: string): Promise<void>;
  verifyEmail(id: string): Promise<void>;
  newLogin(id: string, time: Date): Promise<void>;

  // Delete
  deleteAccount(id: string, time: Date): Promise<void>;
  deleteTwoFactorAuth(id: string): Promise<void>;
}
