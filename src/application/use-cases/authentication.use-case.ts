import type {
  HashService,
  IdService,
  TokenService,
  TwoFactorService,
} from "@application/services";
import type {
  User,
  UserAddress,
  UserIdentifier,
  UserPersonalInfo,
  UserSecurity,
} from "@domain/entities";
import { AppErr, ErrGeneric, ErrUserAuth } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";

export class AuthenticationUseCase {
  constructor(
    // Repository
    private readonly userRepo: UserRepository,
    // Services
    private readonly idSvc: IdService,
    private readonly hashSvc: HashService,
    private readonly tokenSvc: TokenService,
    private readonly tfaSvc: TwoFactorService,
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
        if (conflict === "identity_number")
          throw ErrUserAuth.IdentityNumberExists();
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

  async login(
    creds: Partial<UserIdentifier>,
    ip?: string,
  ): Promise<[string, string]> {
    try {
      if (!creds.password) throw ErrUserAuth.invalidAuth();

      // Get user
      let u:
        | {
            id: string;
            identifier: UserIdentifier;
            security: UserSecurity;
            permissions: string[];
          }
        | undefined;

      if (creds.email) {
        u = await this.userRepo.getUser(
          { email: creds.email },
          "identifier",
          "id",
          "security",
          "permissions",
        );
      } else if (creds.identityNumber) {
        u = await this.userRepo.getUser(
          { identityNumber: creds.identityNumber },
          "identifier",
          "id",
          "security",
          "permissions",
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
      const accessToken = await this.tokenSvc.create("access", {
        sub: u.id,
        email: u.identifier.email,
        identity: u.identifier.identityNumber,
        permissions: u.permissions,
      });

      const refreshToken = await this.tokenSvc.create("refresh", {
        sub: u.id,
      });

      // Save login
      await this.userRepo.newLogin(u.id, new Date());

      return [accessToken, refreshToken];
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async refreshToken(token: string | undefined): Promise<string> {
    try {
      // Check refresh token
      const payload = await this.tokenSvc.verifyToken(token, "refresh");

      // Get user
      const user = await this.userRepo.getUser(
        { id: payload.sub },
        "id",
        "identifier",
        "permissions",
      );
      if (!user) {
        throw ErrGeneric.internal("Unexpected undefined user at refresh token");
      }

      // New token
      const accessToken = await this.tokenSvc.create("access", {
        sub: user.id,
        email: user.identifier.email,
        identity: user.identifier.identityNumber,
        permissions: user.permissions,
      });

      return accessToken;
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async deleteTwoFactorAuth(id: string): Promise<void> {
    // Get user
    const u = await this.userRepo.getUser({ id }, "security");
    if (!u) {
      throw ErrGeneric.internal("Unexpected undefined user at delete 2FA");
    }

    if (u.security.twoFactorAuth) {
      await this.userRepo.deleteTwoFactorAuth(id);
    }
  }

  async createTwoFactorAuth(id: string): Promise<string> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ id }, "identifier", "security");
      if (!u) {
        throw ErrGeneric.internal("Unexpected undefined user at create 2FA");
      }

      // Check if is already enabled
      if (u.security.twoFactorSecret) {
        throw ErrGeneric.conflict();
      }

      const secret = this.tfaSvc.generateSecret();
      const qr = await this.tfaSvc.createQrCode(
        u.identifier.identityNumber,
        secret,
      );

      await this.userRepo.saveTwoFactorSecret(id, secret);

      return qr;
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async loginTwoFactor(id: string, code: string): Promise<[string, string]> {
    // Get user
    const u = await this.userRepo.getUser({ id });
    if (!u) {
      throw ErrGeneric.internal(
        "Unexpected undefined user at verifyTwoFactorAuth",
      );
    }

    if (!u.security.twoFactorSecret) {
      throw ErrUserAuth.notEnabled2FA();
    }

    if (!(await this.tfaSvc.validate(code, u.security.twoFactorSecret))) {
      throw ErrUserAuth.invalid2FA();
    }

    if (!u.security.twoFactorAuth) {
      await this.userRepo.activeTwoFactor(id);
    }

    // Generate token
    const accessToken = await this.tokenSvc.create("access", {
      sub: u.id,
      email: u.identifier.email,
      identity: u.identifier.identityNumber,
      permissions: u.permissions,
    });

    const refreshToken = await this.tokenSvc.create("refresh", {
      sub: u.id,
    });

    return [accessToken, refreshToken];
  }
}
