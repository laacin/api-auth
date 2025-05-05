import type { User, UserIdentifier } from "@domain/entities/user";
import type { UserRepository } from "@domain/repositories";
import type { Document, Model } from "mongoose";

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly model: Model<User & Document>) {}

  // Create
  async saveUser(user: User): Promise<void> {
    const { id, ...rest } = user;
    const u = new this.model({ _id: id, ...rest });
    await u.save();
  }

  // Check
  async isAvailable(
    check: Partial<UserIdentifier>,
  ): Promise<undefined | "email" | "identity_number"> {
    // Dual check
    if (check.email && check.identityNumber) {
      const [email, identityNumber] = await Promise.all([
        this.model.findOne({ "identifier.email": check.email }),
        this.model.findOne({
          "identifier.identityNumber": check.identityNumber,
        }),
      ]);

      if (identityNumber) return "identity_number";
      if (email) return "email";
    }

    // Single check
    if (check.email) {
      const exists = await this.model.findOne({
        "identifier.email": check.email,
      });
      return exists ? "email" : undefined;
    }

    if (check.identityNumber) {
      const exists = await this.model.findOne({
        "identifier.identityNumber": check.identityNumber,
      });
      return exists ? "identity_number" : undefined;
    }
  }

  // Read
  async getUser(identifier: {
    id?: string;
    email?: string;
    identityNumber?: string;
  }): Promise<User | undefined>;
  async getUser<K extends keyof User>(
    identifier: { id?: string; email?: string; identityNumber?: string },
    ...which: K[]
  ): Promise<Pick<User, K> | undefined>;
  async getUser<K extends keyof User>(
    identifier: { id?: string; email?: string; identityNumber?: string },
    ...which: K[]
  ): Promise<User | Pick<User, K> | undefined> {
    // Set container
    let u: (User & Document) | null | undefined;

    // Find
    if (identifier.id) {
      u = await this.model.findById(identifier.id);
    } else if (identifier.email) {
      u = await this.model.findOne({ "identifier.email": identifier.email });
    } else if (identifier.identityNumber) {
      u = await this.model.findOne({
        "identifier.identityNumber": identifier.identityNumber,
      });
    }

    // Not found
    if (!u) return;

    // Response
    const user = toEntity(u.toObject());
    if (which.length === 0) return user;

    const response = {} as Pick<User, K>;
    for (const request of which) {
      response[request] = user[request];
    }

    return response;
  }

  // Update
  async updateMany(id: string, user: PartialDeep<User>): Promise<void> {
    const updates = updateHelper({
      logs: { updatedAt: new Date() },
      ...user,
    });
    const result = await this.model.findByIdAndUpdate(id, updates);
    if (!result) throw invalidId;
  }

  async changeEmail(id: string, email: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "identifier.email": email,
      "logs.updatedAt": new Date(),
    });
    if (!result) throw invalidId;
  }

  async changePassword(id: string, password: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "identifier.password": password,
      "logs.updatedAt": new Date(),
    });
    if (!result) throw invalidId;
  }

  async activeTwoFactor(id: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "security.twoFactorAuth": true,
      "logs.updatedAt": new Date(),
    });
    if (!result) throw invalidId;
  }

  async saveTwoFactorSecret(id: string, secret: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "security.twoFactorSecret": secret,
    });
    if (!result) throw invalidId;
  }

  async verifyEmail(id: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "security.emailVerified": true,
      "logs.updatedAt": new Date(),
    });
    if (!result) throw invalidId;
  }

  async newLogin(id: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "security.lastLogin": new Date(),
    });
    if (!result) throw invalidId;
  }

  // Delete
  async deleteAccount(id: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      "logs.deletedAt": new Date(),
    });
    if (!result) throw invalidId;
  }

  async deleteTwoFactorAuth(id: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, {
      $unset: { "security.twoFactorSecret": "" },
      $set: { "security.twoFactorAuth": false },
    });

    if (!result) throw invalidId;
  }
}

// Errors
const invalidId = new Error("Invalid user ID");

// Helpers
type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends object ? PartialDeep<T[K]> : T[K];
};

const toEntity = (doc: User & Document): User => {
  return {
    id: doc._id as string,

    identifier: {
      email: doc.identifier.email,
      identityNumber: doc.identifier.identityNumber,
      password: doc.identifier.password,
    },

    security: {
      emailVerified: doc.security.emailVerified,
      twoFactorAuth: doc.security.twoFactorAuth,
      twoFactorSecret: doc.security.twoFactorSecret,
      lastLogin: doc.security.lastLogin,
      trustedDevices: doc.security.trustedDevices,
    },

    permissions: doc.permissions,

    profile: {
      firstname: doc.profile.firstname,
      lastname: doc.profile.lastname,
      birthdate: doc.profile.birthdate,
      nationality: doc.profile.nationality,
      gender: doc.profile.gender,
    },

    logs: {
      createdAt: doc.logs.createdAt,
      updatedAt: doc.logs.updatedAt,
      deletedAt: doc.logs.deletedAt,
    },
  };
};

const updateHelper = <T extends object>(
  input: PartialDeep<T>,
): { $set?: Record<string, unknown>; $unset?: Record<string, unknown> } => {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ""> = {};

  function traverse(obj: unknown, prefix = ""): void {
    if (obj === null || typeof obj !== "object") return;

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value === undefined) {
        $unset[path] = "";
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        traverse(value, path);
      } else {
        $set[path] = value;
      }
    }
  }

  traverse(input);

  const update: Record<string, unknown> = {};
  if (Object.keys($set).length > 0) update.$set = $set;
  if (Object.keys($unset).length > 0) update.$unset = $unset;

  return update;
};
