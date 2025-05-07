import { authenticator } from "otplib";
import type { TwoFactorService } from "@application/services";
import { toDataURL } from "qrcode";

export class TwoFactorServiceImpl implements TwoFactorService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  createQrCode(user: string, secret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const otpAuthUri = authenticator.keyuri(user, "api-auth", secret);
      toDataURL(otpAuthUri, (err, qr) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(qr);
      });
    });
  }

  validate(code: string, secret: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const result = authenticator.check(code, secret);
      resolve(result);
    });
  }
}
