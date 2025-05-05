// MAIN USER
export interface User {
  // Main ID
  id: string;

  // Modules
  identifier: UserIdentifier;
  security: UserSecurity;
  permissions: string[];
  profile: UserProfile;
  address?: UserAddress;
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
  trustedDevices: TrustedDevice[];
}

interface UserProfile {
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

interface UserLogs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Extras
interface TrustedDevice {
  deviceId: string;
  deviceName: string;
}

export type {
  UserIdentifier,
  UserSecurity,
  UserProfile,
  UserAddress,
  UserLogs,
  TrustedDevice,
};
