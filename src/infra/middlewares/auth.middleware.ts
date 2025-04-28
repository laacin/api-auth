import type { TokenService } from "@application/services";
import type { Controller } from "@infra/http";

export class AuthMiddleware {
  constructor(private readonly tokenSvc: TokenService) {}

  isAuth(): Controller {
    return async (req, res, next) => {
      try {
        const id = await this.tokenSvc.verifyToken(req.token);
        req.setUser(id);

        next();
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
