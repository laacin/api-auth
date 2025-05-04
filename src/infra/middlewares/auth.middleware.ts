import type { TokenService } from "@application/services";
import { ErrGeneric } from "@domain/errs";
import type { ControllerImpl } from "@infra/http/controller.impl";

export class AuthMiddleware {
  constructor(private readonly tokenSvc: TokenService) {}

  setUser(from?: "cookie" | "bearer"): ControllerImpl {
    return async (req, res, next) => {
      try {
        let token: string | undefined;

        if (from && from === "cookie") {
          token = req.tokens.cookieAuth;
        } else {
          token = req.tokens.bearerAuth;
        }

        const { sub, ...rest } = await this.tokenSvc.verifyToken(
          token,
          "access",
          true,
        );

        req.setter.user({ id: sub, ...rest });

        next();
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }

  setDevice(): ControllerImpl {
    return async (req, res, next) => {
      try {
        if (!req.client.user) throw ErrGeneric.unauthenticated();

        const token = req.tokens.deviceToken;
        const payload = await this.tokenSvc.verifyToken(token, "device_info");

        req.setter.device({
          deviceId: payload.sub,
          deviceName: payload.name,
          userId: req.client.user.id,
        });

        next();
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
