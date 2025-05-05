import type { UserRepository } from "@domain/repositories";
import type { userModel } from "../models/user/user.model";
import type { User, UserIdentifier, UserSecurity } from "@domain/entities/user";
import type { Document } from "mongoose";

type UserModel = typeof userModel;

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly model: UserModel) {}

  // ---- Create
  async saveUser(user: User): Promise<void> {
    const { id, ...rest } = user;
    const u = new this.model({ _id: id, ...rest });
    await u.save();
  }

  // ---- Check
  async isAvailable(
    check: Partial<UserIdentifier>,
  ): Promise<undefined | "email" | "identity_number"> {
    if (check.email && check.identityNumber) {
      // Double query
      const [emailExists, identityNumExists] = await Promise.all([
        this.model.findOne({ "identifier.email": check.email }).exec(),
        this.model
          .findOne({ "identifier.identityNumber": check.identityNumber })
          .exec(),
      ]);

      if (emailExists) return "email";
      if (identityNumExists) return "identity_number";
    }

    // Single query
    if (check.email) {
      const u = await this.model
        .findOne({ "identifier.email": check.email })
        .exec();
      if (u) return "email";
    }

    if (check.identityNumber) {
      const u = await this.model
        .findOne({ "identifier.identityNumber": check.identityNumber })
        .exec();
      if (u) return "identity_number";
    }
  }

  async isEmailVerified(id: string): Promise<boolean> {
    const u = await this.model.findById(id);
    if (!u) return false;
    return u.security.emailVerified;
  }

  async isTwoFactorEnabled(id: string): Promise<boolean> {
    const u = await this.model.findById(id);
    if (!u) return false;
    return u.security.twoFactorAuth;
  }

  // ---- Read
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
    // Find user
    let u: (User & Document) | null | undefined;
    if (identifier.id) {
      u = await this.model.findById(identifier.id);
    } else if (identifier.email) {
      u = await this.model.findOne({ "identifier.email": identifier.email });
    } else if (identifier.identityNumber) {
      u = await this.model.findOne({
        "identifier.identityNumber": identifier.identityNumber,
      });
    }

    if (!u || u.logs.deletedAt) return undefined;

    if (!which || which.length < 1) return toEntity(u);

    const data: Partial<Pick<User, K>> = {};
    for (const k of which) {
      data[k] = u[k];
    }

    return data as Pick<User, K>;
  }

  // Update
  async updateMany(id: string, user: Partial<User>): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, user);
    if (!u) throw invalidId;
  }

  async changeEmail(id: string, email: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "identifier.email": email,
    });
    if (!u) throw invalidId;
  }

  async changePassword(id: string, password: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "identifier.password": password,
    });
    if (!u) throw invalidId;
  }

  async saveTwoFactorSecret(id: string, secret: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "security.twoFactorSecret": secret,
    });
    if (!u) throw invalidId;
  }

  async verifyEmail(id: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "security.emailVerified": true,
    });
    if (!u) throw invalidId;
  }

  async newLogin(id: string, time: Date): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "security.lastLogin": time,
    });
    if (!u) throw invalidId;
  }

  // Delete
  async deleteAccount(id: string, time: Date): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "logs.deletedAt": time,
    });
    if (!u) throw invalidId;
  }

  async deleteTwoFactorAuth(id: string): Promise<void> {
    const upd: Partial<UserSecurity> = {
      twoFactorAuth: false,
      twoFactorSecret: undefined,
    };

    const u = await this.model.findByIdAndUpdate(id, {
      $set: { security: upd },
    });
    if (!u) throw invalidId;
  }
}

// TODO: fix this =>
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

// Error
const invalidId = new Error("Invalid user ID");
