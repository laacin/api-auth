import type { User } from "@domain/entities";

export interface EmailService {
  sendVerifyEmail(user: User, token: string): Promise<void>;
  sendRecoveryPassword(user: User, token: string): Promise<void>;
}
