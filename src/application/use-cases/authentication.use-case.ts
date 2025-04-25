import type {
  HashService,
  IdService,
  TokenService,
} from "@application/services";
import type {
  User,
  UserAddress,
  UserIdentifier,
  UserPersonalInfo,
  UserSecurity,
} from "@domain/entities";
import { AppErr, ErrGeneric, ErrUserAuth, ErrUserRecovery } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";
import { TokenType } from "@domain/security";

export class AuthenticationUseCase {
  constructor(
    // Repository
    private readonly userRepo: UserRepository,
    // Services
    private readonly idSvc: IdService,
    private readonly hashSvc: HashService,
    private readonly tokenSvc: TokenService,
  ) {}

  // ---- Register & Login
  async createAccount(input: {
    identifier: UserIdentifier;
    personalInfo: UserPersonalInfo;
    address: UserAddress;
  }): Promise<void> {
    try {
      // Check if exists
      const conflict = await this.userRepo.isAvailable(input.identifier);
      if (conflict) {
        if (conflict === "email") throw ErrUserAuth.emailExists();
        if (conflict === "identity_number") throw ErrUserAuth.idExists();
      }

      // Setup user
      const now = new Date();
      const user: User = {
        id: this.idSvc.create(),

        logs: {
          createdAt: now,
          updatedAt: now,
          deletedAt: undefined,
        },

        identifier: {
          email: input.identifier.email,
          identityNumber: input.identifier.identityNumber,
          password: await this.hashSvc.generate(input.identifier.password),
        },

        security: {
          emailVerified: false,
          twoFactorAuth: false,
          lastLogin: undefined,
        },

        permissions: ["NOT_IMPLEMENTED"],

        personalInfo: input.personalInfo,
        address: input.address,
      };

      // Try to save
      await this.userRepo.saveUser(user);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async login(creds: Partial<UserIdentifier>, ip?: string): Promise<string> {
    try {
      if (!creds.password) throw ErrUserAuth.invalidAuth();

      // Get user
      let u:
        | { id: string; identifier: UserIdentifier; security: UserSecurity }
        | undefined;

      if (creds.email) {
        u = await this.userRepo.getUser(
          { email: creds.email },
          "identifier",
          "id",
          "security",
        );
      } else if (creds.identityNumber) {
        u = await this.userRepo.getUser(
          { identityNumber: creds.identityNumber },
          "identifier",
          "id",
          "security",
        );
      }

      // Compare credentials
      if (
        !u ||
        !(await this.hashSvc.compare(creds.password, u.identifier.password))
      ) {
        throw ErrUserAuth.invalidAuth();
      }

      // 2FA
      if (u.security.twoFactorAuth) {
        if (u.security.lastIp && u.security.lastIp !== ip) {
          throw ErrUserAuth.required2FA();
        }
      }

      // Generate token
      const token = await this.tokenSvc.create(TokenType.AUTHENTICATION, u.id);

      // Save login
      await this.userRepo.newLogin(u.id, new Date());

      return token;
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  // ---- Validate email
  async emailVerificationToken(id: string): Promise<string> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ id }, "security");
      if (!u) throw ErrGeneric.internal("Unexpected undefined user");

      // Check if is already verified
      if (u.security.emailVerified)
        throw ErrUserRecovery.emailIsAlreadyVerified();

      // Generate token
      return await this.tokenSvc.create(TokenType.EMAIL_VALIDATION, id);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async emailVerify(token: string): Promise<void> {
    try {
      // Check token
      const payload = await this.tokenSvc.verifyToken(token);
      if (payload.type !== TokenType.EMAIL_VALIDATION) return;

      await this.userRepo.verifyEmail(payload.id);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }
}
