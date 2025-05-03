import type { TokenService } from "@application/services";
import type { Controller } from "@interfaces/http";

export class AuthMiddleware {
  constructor(private readonly tokenSvc: TokenService) {}

  isAuth(): Controller {
    return async (req, res, next) => {
      try {
        const payload = await this.tokenSvc.verifyToken(req.token, "access");
        req.setUser(payload.sub);

        next();
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
