import type {
  HashService,
  IdService,
  TokenService,
} from "@application/services";
import type { UserIdentifier, UserProfile } from "@domain/entities";
import { AppErr, ErrGeneric, ErrUserAuth, ErrUserRecovery } from "@domain/errs";
import type { UserRepository } from "@domain/repositories";

export class AuthenticationUseCase {
  constructor(
    // Repository
    private readonly userRepo: UserRepository,
    // Services
    private readonly idSvc: IdService,
    private readonly hashSvc: HashService,
    private readonly tokenSvc: TokenService,
  ) {}

  // Methods
  async createAccount(
    identifier: Omit<UserIdentifier, "id">,
    profile: Omit<UserProfile, "id">,
  ): Promise<void> {
    try {
      // Check if exists
      const conflict = await this.userRepo.isAvailable({
        email: identifier.email,
        document: {
          type: profile.documentType,
          number: profile.documentNumber,
        },
        phone: identifier.phone,
      });
      if (conflict) {
        switch (conflict) {
          case "email":
            throw ErrUserAuth.emailExists();
          case "dni": // TODO: <-- fix name
            throw ErrUserAuth.idExists();
          case "phone":
            throw ErrUserAuth.phoneExists();
          default:
            throw ErrGeneric.internal("Unexpected conflict error");
        }
      }

      // Setup User
      const now = new Date();
      const uuid = this.idSvc.create();

      const uIdent: UserIdentifier = {
        id: uuid,

        // Identifier
        email: identifier.email,
        password: await this.hashSvc.generate(identifier.password),

        // Security
        phone: identifier.phone,
        emailVerified: false,
        twoFactorAuth: false,

        // Logs
        createdAt: now,
        updatedAt: now,
      };

      const uProf: UserProfile = {
        id: uuid,

        // Identity
        documentType: profile.documentType,
        documentNumber: profile.documentNumber,
        nationality: profile.nationality,

        // Personal info
        firstname: profile.firstname,
        lastname: profile.lastname,
        birthdate: profile.birthdate,
        gender: profile.gender,

        // Address
        address: profile.address,
        postalCode: profile.postalCode,
        province: profile.province,
        city: profile.city,

        wallets: [],
      };

      // Try to save
      await this.userRepo.newUser({ identifier: uIdent, profile: uProf });
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async login(login: {
    email: string;
    ip: string;
    password: string;
  }): Promise<string> {
    try {
      // Get user
      const u = await this.userRepo.getUserByEmail(login.email);

      // Compare credentials
      if (!u || !(await this.hashSvc.compare(login.password, u.password))) {
        throw ErrUserAuth.invalidAuth();
      }

      // 2FA
      if (u.twoFactorAuth) {
        if (!u.lastIp || login.ip !== u.lastIp) {
          throw ErrUserAuth.required2FA();
        }
      }

      // New login
      await this.userRepo.newLogin(u.id, new Date());

      // Token
      const token = await this.tokenSvc.newToken(u.id);

      return token;
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async emailVerificationToken(email: string): Promise<string> {
    try {
      // Get user
      const u = await this.userRepo.getUserByEmail(email);
      if (!u) throw ErrUserAuth.invalidAuth(); // <--- wrong error

      // Check is already verified
      if (u.emailVerified) throw ErrUserRecovery.emailIsAlreadyVerified();

      // Token
      return await this.tokenSvc.newToken(u.id);
    } catch (err) {
      throw err instanceof AppErr ? err : ErrGeneric.internal(err);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // Verify token
      const id = await this.tokenSvc.verifyToken(token);

      // try to verify
      await this.userRepo.verifyEmail(id);
    } catch (err) {
      throw err instanceof Error ? err : err;
    }
  }
}
