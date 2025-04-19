import type {
  HashService,
  IdService,
  TokenService,
} from "@application/services";
import type { UserIdentifier, UserProfile } from "@domain/entities";
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
  ) {
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
            return new Error("email is already used");
          case "dni":
            return new Error("an account with this DNI is already exists");
          case "phone":
            return new Error("phone number is already used");
          default:
            return new Error("Unexpected conflict error");
        }
      }

      // Setup User
      const now = new Date();
      const uuid = this.idSvc.create();

      const uIdent: UserIdentifier = {
        id: uuid,
        email: identifier.email,
        phone: identifier.phone,
        password: await this.hashSvc.generate(identifier.password),
        emailVerified: false,
        twoFactorAuth: false,
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
      throw err instanceof Error ? err : err;
    }
  }

  async login(login: { email: string; ip: string; password: string }) {
    try {
      // Get user
      const u = await this.userRepo.getUserByEmail(login.email);

      // Compare credentials
      if (!u || !(await this.hashSvc.compare(login.password, u.password))) {
        throw new Error("Invalid email or password");
      }

      // 2FA
      if (u.twoFactorAuth) {
        if (!u.lastIp || login.ip !== u.lastIp) {
          throw new Error("2FA required");
        }
      }

      // New login
      await this.userRepo.newLogin(u.id, new Date());

      // Token
      const token = await this.tokenSvc.idToken(u.id);

      return token;
    } catch (err) {
      throw err instanceof Error ? err : err;
    }
  }
}
