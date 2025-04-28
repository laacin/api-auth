import type { TokenService } from "@application/services";
import { AppErr, ErrGeneric, ErrUserAuth, ErrUserRecovery } from "@domain/errs";
import { type TokenPayload, TokenType } from "@domain/security";
import {
  sign,
  TokenExpiredError,
  verify,
  type SignOptions,
} from "jsonwebtoken";

export class TokenServiceImpl implements TokenService {
  constructor(private readonly secretKey: string) {}

  async create(type: TokenType, id: string): Promise<string> {
    const payload: TokenPayload = { type, sub: id };

    let opts: SignOptions | undefined;
    switch (payload.type) {
      case TokenType.AUTHENTICATION:
        opts = { algorithm: "HS256", expiresIn: "1h" };
        break;
      case TokenType.EMAIL_VALIDATION:
        opts = { algorithm: "HS256", expiresIn: "30m" };
        break;
      case TokenType.PASSWORD_RECOVERY:
        opts = { algorithm: "HS256", expiresIn: "15m" };
        break;
      default:
        opts = { algorithm: "HS256", expiresIn: "1h" };
    }

    const token = sign(payload, this.secretKey, opts);

    return token;
  }

  async verifyToken(token?: string, expected?: TokenType): Promise<string> {
    if (!token) throw ErrGeneric.missingToken();

    try {
      const pay = verify(token, this.secretKey) as TokenPayload;

      if (!pay || !pay.sub || !pay.type) {
        throw ErrGeneric.invalidToken();
      }

      if (expected && pay.type !== expected) {
        throw ErrGeneric.invalidToken();
      }

      return pay.sub;
    } catch (err) {
      if (err instanceof AppErr) throw err;

      if (err instanceof TokenExpiredError) {
        if (!expected) throw ErrGeneric.invalidToken();
        switch (expected) {
          case TokenType.AUTHENTICATION:
            throw ErrUserAuth.authExpired();
          case TokenType.EMAIL_VALIDATION:
            throw ErrUserRecovery.emailRecoveryExpired();
          case TokenType.PASSWORD_RECOVERY:
            throw ErrUserRecovery.passwordRecoveryExpired();
          default:
            ErrGeneric.invalidToken();
        }
      }

      throw ErrGeneric.invalidToken();
    }
  }
}
