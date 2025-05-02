export interface TwoFactorService {
  generateSecret(): string;
  createQrCode(user: string, secret: string): Promise<string>;
  validate(code: string, secret: string): Promise<boolean>;
}
