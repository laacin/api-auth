export interface TwoFactorService {
  generateSecret(): string;
  createQrCode(data: string): Promise<string>;
  validate(code: string, secret: string): Promise<boolean>;
}
