import type { User } from "@domain/entities/user";

export interface EmailService {
  sendVerifyEmail(user: User, token: string, path: string): Promise<void>;
  sendRecoveryPassword(user: User, token: string, path: string): Promise<void>;
}
