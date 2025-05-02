// MAIN USER
export interface User {
  // Main ID
  id: string;

  // Modules
  identifier: UserIdentifier;
  security: UserSecurity;
  permissions: string[];
  personalInfo: UserPersonalInfo;
  address?: UserAddress;
  experience?: UserExperience;
  logs: UserLogs;
}

// Modules
interface UserIdentifier {
  identityNumber: string;
  email: string;
  password: string;
}

interface UserSecurity {
  emailVerified: boolean;
  twoFactorAuth: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
}

interface UserPersonalInfo {
  firstname: string;
  lastname: string;
  birthdate: Date;
  nationality: string;
  gender?: string;
}

interface UserAddress {
  region: string;
  postalCode: string;
  city: string;
  address: string;
}

interface UserExperience {
  investmentExperience: string;
  riskTolerance: string;
}

interface UserLogs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type {
  UserIdentifier,
  UserSecurity,
  UserPersonalInfo,
  UserAddress,
  UserExperience,
  UserLogs,
};
