import type { TokenService } from "@application/services";
import { TokenType } from "@domain/security";
import type { Controller } from "@interfaces/http";

export class AuthMiddleware {
  constructor(private readonly tokenSvc: TokenService) {}

  isAuth(): Controller {
    return async (req, res, next) => {
      try {
        const id = await this.tokenSvc.verifyToken(
          req.token,
          TokenType.AUTHENTICATION,
        );
        req.setUser(id);

        next();
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
