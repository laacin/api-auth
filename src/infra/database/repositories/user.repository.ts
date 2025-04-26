import type { User, UserIdentifier } from "@domain/entities";
import type { UserRepository } from "@domain/repositories";
import type { Model } from "mongoose";
import type { UserDocument } from "../models";

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly model: Model<UserDocument>) {}

  // ---- Create
  async saveUser(user: User): Promise<void> {
    const toSave: Omit<User, "id"> = user;
    const u = new this.model({ _id: user.id, ...toSave });
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
    let u: UserDocument | null | undefined;
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
    const result = toEntity(u.toObject());

    if (!which || which.length < 1) return result;

    const data: Partial<Pick<User, K>> = {};
    for (const k of which) {
      data[k] = result[k];
    }

    return data as Pick<User, K>;
  }

  async getTwoFactorSecret(id: string): Promise<string> {
    const u = await this.model.findById(id);
    if (!u) throw new Error("Invalid user ID");

    return u.security.twoFactorSecret ?? "";
  }

  // Update
  async changeEmail(id: string, email: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "identifier.email": email,
    });
    if (!u) throw new Error("Invalid user ID");
  }

  async changePassword(id: string, password: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "identifier.password": password,
    });
    if (!u) throw new Error("Invalid user ID");
  }

  async saveTwoFactorSecret(id: string, secret: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "security.twoFactorSecret": secret,
    });
    if (!u) throw new Error("Invalid user ID");
  }

  async verifyEmail(id: string): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "security.emailVerified": true,
    });
    if (!u) throw new Error("Invalid user ID");
  }

  async newLogin(id: string, time: Date): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "security.lastLogin": time,
    });
    if (!u) throw new Error("Invalid user ID");
  }

  // Delete
  async deleteAccount(id: string, time: Date): Promise<void> {
    const u = await this.model.findByIdAndUpdate(id, {
      "logs.deletedAt": time,
    });
    if (!u) throw new Error("Invalid user ID");
  }
}

// TODO: fix this =>
const toEntity = (doc: UserDocument): User => {
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
      lastIp: doc.security.lastIp,
      lastLogin: doc.security.lastLogin,
    },

    permissions: doc.permissions,

    personalInfo: {
      firstname: doc.personalInfo.firstname,
      lastname: doc.personalInfo.lastname,
      birthdate: doc.personalInfo.birthdate,
      nationality: doc.personalInfo.nationality,
      gender: doc.personalInfo.gender,
    },

    experience: {
      investmentExperience: doc.experience?.investmentExperience ?? "",
      riskTolerance: doc.experience?.riskTolerance ?? "",
    },

    logs: {
      createdAt: doc.logs.createdAt,
      updatedAt: doc.logs.updatedAt,
      deletedAt: doc.logs.deletedAt,
    },
  };
};
