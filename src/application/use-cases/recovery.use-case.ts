import type { TokenService } from "@application/services";
import type { UserRepository } from "@domain/repositories";

export class RecoveryUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenSvc: TokenService,
  ) {}

  // Returns undefined if credentials are incorrect
  async passwordToken(email: string, dni: string): Promise<string | undefined> {
    try {
      const u = await this.userRepo.getUserByEmail(email);
      if (!u) return undefined;

      const profile = await this.userRepo.getProfile(u.id);

      if (profile.documentNumber !== dni) {
        return undefined;
      }

      return await this.tokenSvc.newToken(u.id);
    } catch (err) {
      throw err instanceof Error ? err : err;
    }
  }
}
