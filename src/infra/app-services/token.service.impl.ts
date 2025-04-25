import type { TokenService } from "@application/services";
import { AppErr, ErrGeneric } from "@domain/errs";
import { type TokenPayload, TokenType } from "@domain/security";
import { sign, verify, type SignOptions } from "jsonwebtoken";

export class TokenServiceImpl implements TokenService {
  constructor(private readonly secretKey: string) {}

  async create(type: TokenType, id: string): Promise<string> {
    const payload: TokenPayload = { type, id };

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

  async verifyToken(token?: string): Promise<TokenPayload> {
    if (!token) throw ErrGeneric.forbidden();

    try {
      const pay = verify(token, this.secretKey) as TokenPayload;
      return pay;
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.forbidden();
    }
  }
}
