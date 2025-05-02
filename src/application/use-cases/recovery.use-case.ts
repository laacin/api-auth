import type { EmailService, TokenService } from "@application/services";
import { AppErr, ErrGeneric, ErrUserRecovery } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";

export class RecoveryUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenSvc: TokenService,
    private readonly emailSvc: EmailService,
  ) {}

  // ---- Validate email
  async emailVerificationRequest(id: string, path: string): Promise<void> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ id });
      if (!u) throw ErrGeneric.internal("Unexpected undefined user");

      // Check if is already verified
      if (u.security.emailVerified)
        throw ErrUserRecovery.emailIsAlreadyVerified();

      // Generate token
      const token = await this.tokenSvc.create("email_validation", { sub: id });

      await this.emailSvc.sendVerifyEmail(u, token, path);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async emailVerify(token: string | undefined): Promise<void> {
    try {
      // Check token
      const payload = await this.tokenSvc.verifyToken(
        token,
        "email_validation",
      );

      await this.userRepo.verifyEmail(payload.sub);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  // ---- Password recovery
  // Returns undefined if credentials are incorrect
  async passwordRecoveryRequest(
    email: string,
    identityNumber: string,
    path: string,
  ): Promise<void> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ email });
      if (!u || u.identifier.identityNumber !== identityNumber) {
        return;
      }

      const token = await this.tokenSvc.create("password_recovery", {
        sub: u.id,
      });

      await this.emailSvc.sendRecoveryPassword(u, token, path);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }
}
