import type { TokenService } from "@application/services";
import { AppErr, ErrGeneric, ErrUserAuth, ErrUserRecovery } from "@domain/errs";
import type { Payload } from "@domain/security";
import {
  sign,
  TokenExpiredError,
  verify,
  type SignOptions,
} from "jsonwebtoken";

interface TokenEnvironment {
  // Keys
  secretKey: string;
  // Expiration
  accessExp: string;
  refreshExp: string;
}

export class TokenServiceImpl implements TokenService {
  constructor(private readonly tokenEnv: TokenEnvironment) {}

  create<T extends Payload, K extends keyof T>(
    type: K,
    payload: T[K],
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Options
      let opts: SignOptions | undefined;
      switch (type as keyof Payload) {
        case "access":
          opts = {
            algorithm: "HS256",
            expiresIn: this.tokenEnv.accessExp as SignOptions["expiresIn"],
          };
          break;
        case "refresh":
          opts = {
            algorithm: "HS256",
            expiresIn: this.tokenEnv.refreshExp as SignOptions["expiresIn"],
          };
          break;
        default:
          reject(ErrGeneric.internal("Unexpected token type"));
      }

      // Create token
      try {
        const content: Content = {
          type: type as keyof Payload,
          payload,
        };
        const token = sign(content, this.tokenEnv.secretKey, opts);
        resolve(token);
      } catch (err) {
        reject(err);
      }
    });
  }

  verifyToken(token: string | undefined): Promise<string>;
  verifyToken<T extends Payload, K extends keyof T>(
    token: string | undefined,
    expected: K,
    strict?: boolean,
  ): Promise<T[K]>;
  verifyToken<T extends Payload, K extends keyof T>(
    token: string | undefined,
    expected?: K,
    strict?: boolean,
  ): Promise<string | T[K]> {
    return new Promise<string | T[K]>((resolve, reject) => {
      const key = expected as keyof Payload | undefined;
      // Verify token
      if (!token) {
        reject(ErrGeneric.missingToken());
        return;
      }

      try {
        const content = verify(token, this.tokenEnv.secretKey);
        if (strict && key && key !== (content as Content).type) {
          reject(ErrGeneric.invalidToken());
          return;
        }

        const result = expected
          ? ((content as Content).payload as T[K])
          : (content as string);

        resolve(result);
      } catch (err) {
        if (err instanceof AppErr) throw err;

        if (err instanceof TokenExpiredError) {
          if (!key) throw ErrGeneric.invalidToken();
          switch (key) {
            case "access":
              throw ErrUserAuth.sessionExpired();

            case "refresh":
              throw ErrUserAuth.sessionExpired();

            case "email_validation":
              throw ErrUserRecovery.emailVerificationExpired();

            case "email_recovery":
              throw ErrUserRecovery.emailRecoveryExpired();

            case "password_recovery":
              throw ErrUserRecovery.passwordRecoveryExpired();

            default:
              throw ErrGeneric.invalidToken();
          }
        }

        throw ErrGeneric.invalidToken();
      }
    });
  }
}

// Helper
interface Content {
  type: keyof Payload;
  payload: unknown;
}
