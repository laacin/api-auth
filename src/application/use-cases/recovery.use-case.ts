import type { EmailService, TokenService } from "@application/services";
import { AppErr, ErrGeneric, ErrUserRecovery } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";
import { TokenType } from "@domain/security";

export class RecoveryUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenSvc: TokenService,
    private readonly emailSvc: EmailService,
  ) {}

  // ---- Validate email
  async emailVerificationRequest(id: string): Promise<void> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ id });
      if (!u) throw ErrGeneric.internal("Unexpected undefined user");

      // Check if is already verified
      if (u.security.emailVerified)
        throw ErrUserRecovery.emailIsAlreadyVerified();

      // Generate token
      const token = await this.tokenSvc.create(TokenType.EMAIL_VALIDATION, id);

      await this.emailSvc.sendVerifyEmail(u, token);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async emailVerify(token: string): Promise<void> {
    try {
      // Check token
      const id = await this.tokenSvc.verifyToken(
        token,
        TokenType.EMAIL_VALIDATION,
      );

      await this.userRepo.verifyEmail(id);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  // ---- Password recovery
  // Returns undefined if credentials are incorrect
  async passwordToken(email: string, identityNumber: string): Promise<void> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ email });
      if (!u || u.identifier.identityNumber !== identityNumber) {
        return;
      }

      const token = await this.tokenSvc.create(
        TokenType.PASSWORD_RECOVERY,
        u.id,
      );

      await this.emailSvc.sendRecoveryPassword(u, token);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }
}
