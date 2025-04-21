export interface User {
  // Main ID
  id: string;

  // Identifier
  identifier: {
    identityNumber: string;
    email: string;
    password: string;
  };

  // Security
  security: {
    emailVerified: boolean;
    twoFactorAuth: boolean;
    twoFactorSecret?: string;
    lastIp?: string;
  };

  // Permissions
  permissions: string[];

  // Personal Info
  profile: {
    personalInfo: {
      firstname: string;
      lastname: string;
      birthdate: Date;
      nationality: string;
      gender?: string;
    };

    address: {
      address: string;
      postalCode: string;
      province: string;
      city: string;
    };

    experience?: {
      investmentExperience: "none" | "basic" | "intermediate" | "advanced";
      riskTolerance: "low" | "medium" | "high";
    };
  };

  // Logs
  logs: {
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  };
}
