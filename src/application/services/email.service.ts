export interface EmailService {
  verifyEmail(to: string, token: string): Promise<void>;
  recoveryPassword(to: string, token: string): Promise<void>;
}
