import type { TokenService } from "@application/services";
import { AppErr, ErrGeneric } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";
import { TokenType } from "@domain/security";

export class RecoveryUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenSvc: TokenService,
  ) {}

  // Returns undefined if credentials are incorrect
  async passwordToken(
    email: string,
    identityNumber: string,
  ): Promise<string | undefined> {
    try {
      // Get user
      const u = await this.userRepo.getUserByEmail(email, "identifier", "id");
      if (!u || u.identifier.identityNumber !== identityNumber) {
        return undefined;
      }

      return await this.tokenSvc.create(TokenType.PASSWORD_RECOVERY, u.id);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }
}
