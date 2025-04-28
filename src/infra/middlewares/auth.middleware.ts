import type { TokenService } from "@application/services";
import { ErrGeneric } from "@domain/errs";
import { TokenType } from "@domain/security";
import type { Controller } from "@infra/http";

export class AuthMiddleware {
  constructor(private readonly tokenSvc: TokenService) {}

  isAuth(): Controller {
    return async (req, res, next) => {
      try {
        const token = req.token;
        if (!token) throw ErrGeneric.unauthenticated();

        const payload = await this.tokenSvc.verifyToken(token);

        if (payload.type !== TokenType.AUTHENTICATION) {
          throw ErrGeneric.forbidden();
        }
        req.setUser(payload.id);

        next();
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
