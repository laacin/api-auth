import type { UserIdentifier, UserProfile } from "@domain/entities";

export interface UserRepository {
  // Create
  newUser(user: {
    identifier: UserIdentifier;
    profile: UserProfile;
  }): Promise<void>;

  // Check
  isAvailable(email: string): Promise<boolean>;
  isEmailVerified(id: string): Promise<boolean>;
  isTwoFactorEnabled(id: string): Promise<boolean>;

  // Read
  getUserById(id: string): Promise<UserIdentifier>;
  getUserByEmail(email: string): Promise<UserIdentifier>;
  getTwoFactorSecret(id: string): Promise<string>;
  getProfile(id: string): Promise<UserProfile>;

  // Update
  changeEmail(id: string, email: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  changePhone(id: string, phone: string): Promise<void>;
  saveTwoFactorSecret(id: string, secret: string): Promise<void>;
  verifyEmail(id: string): Promise<void>;
  updateProfile(profile: UserProfile): Promise<void>;

  // Delete
  deleteAccount(id: string): Promise<void>;
}
