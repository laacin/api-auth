import type { RecoveryUseCase } from "@application/use-cases";
import { ErrGeneric } from "@domain/errs";
import type { Controller } from "@interfaces/http";

export class RecoveryControllers {
  constructor(private readonly recoveryUseCase: RecoveryUseCase) {}

  sendEmailVerificationToken(path: string): Controller {
    return async (req, res) => {
      try {
        if (!req.client.user) throw ErrGeneric.unauthenticated();

        await this.recoveryUseCase.emailVerificationRequest(
          req.client.user.id,
          path,
        );

        res.sendSuccess(200, "Email verification was sent");
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }

  emailVerification(): Controller {
    return async (req, res) => {
      try {
        const { token } = req.url.query ?? {};

        if (!token) {
          res.sendError(400, "missing token");
          return;
        }

        await this.recoveryUseCase.emailVerify(token);

        res.sendSuccess(200, "Email verificated successfully");
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
