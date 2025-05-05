import type { UserCacheRepository } from "@application/cache/auth.cache";
import type {
  HashService,
  IdService,
  TokenService,
  TwoFactorService,
} from "@application/services";
import type {
  TrustedDevice,
  User,
  UserAddress,
  UserIdentifier,
  UserProfile,
} from "@domain/entities/user";
import { AppErr, ErrGeneric, ErrUserAuth } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";

export class AuthenticationUseCase {
  constructor(
    // Repository
    private readonly userRepo: UserRepository,
    // Cache
    private readonly cache: UserCacheRepository,
    // Services
    private readonly idSvc: IdService,
    private readonly hashSvc: HashService,
    private readonly tokenSvc: TokenService,
    private readonly tfaSvc: TwoFactorService,
  ) {}

  // ---- Register & Login
  async createAccount(input: {
    identifier: UserIdentifier;
    profile: UserProfile;
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
          trustedDevices: [],
          emailVerified: false,
          twoFactorAuth: false,
          lastLogin: undefined,
        },

        permissions: ["NOT_IMPLEMENTED"],

        profile: input.profile,
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
    device?: TrustedDevice,
  ): Promise<AuthTokens> {
    try {
      if (!creds.password) throw ErrUserAuth.invalidAuth();

      // Get user
      const u = await this.userRepo.getUser(
        { email: creds.email, identityNumber: creds.identityNumber },
        "id",
        "identifier",
        "security",
        "permissions",
      );

      // Compare credentials
      if (
        !u ||
        !(await this.hashSvc.compare(creds.password, u.identifier.password))
      ) {
        throw ErrUserAuth.invalidAuth();
      }

      // 2FA

      if (u.security.twoFactorAuth) {
        if (!device || !u.security.trustedDevices.includes(device)) {
          throw ErrUserAuth.required2FA();
        }
      }

      // Generate token
      const tokens = await generateAuthTokens(this.tokenSvc, {
        id: u.id,
        email: u.identifier.email,
        identityNumber: u.identifier.identityNumber,
        permissions: u.permissions,
      });

      // Save login
      await this.userRepo.newLogin(u.id);

      return tokens;
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

  // ---- Two Factor Authentication
  async deleteTwoFactorAuth(id: string): Promise<void> {
    try {
      // Get user
      const u = await this.userRepo.getUser({ id }, "security");
      if (!u) {
        throw ErrGeneric.internal("Unexpected undefined user at delete 2FA");
      }

      if (u.security.twoFactorAuth) {
        await this.userRepo.deleteTwoFactorAuth(id);
      }
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
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

  async loginTwoFactor(id: string, code: string): Promise<AuthTokens> {
    try {
      // Get user
      const u = await this.userRepo.getUser(
        { id },
        "security",
        "identifier",
        "permissions",
      );
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
      const tokens = await generateAuthTokens(this.tokenSvc, {
        id,
        email: u.identifier.email,
        identityNumber: u.identifier.identityNumber,
        permissions: u.permissions,
      });

      await this.userRepo.newLogin(id);

      return tokens;
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async logout(tokens: AuthTokens): Promise<void> {
    try {
      // Tokens
      await Promise.all([
        this.cache.revokeToken(tokens.access),
        this.cache.revokeToken(tokens.refresh),
      ]);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }
}

// Helpers
interface AuthTokens {
  access: string;
  refresh: string;
}

const generateAuthTokens = async (
  service: TokenService,
  data: {
    id: string;
    email: string;
    identityNumber: string;
    permissions: string[];
  },
): Promise<AuthTokens> => {
  const [access, refresh] = await Promise.all([
    service.create("access", {
      sub: data.id,
      email: data.email,
      identity: data.identityNumber,
      permissions: data.permissions,
    }),

    service.create("refresh", {
      sub: data.id,
    }),
  ]);

  return { access, refresh };
};
