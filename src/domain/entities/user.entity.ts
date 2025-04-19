interface UserIdentifier {
  // Identifier
  id: string;
  email: string;
  password: string;

  // Security
  emailVerified: boolean;
  twoFactorAuth: boolean;
  twoFactorSecret?: string;

  // Logs
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface UserProfile {
  // Identifier
  id: string;

  // Personal info
  firstname: string;
  lastname: string;
  birthdate: string;
  gender: "male" | "female";
  phone: string;

  // Identity
  documentType: "DNI";
  documentNumber: string;
  nationality: string;

  // Address
  address: string;
  postalCode: string;
  province: string;
  city: string;

  // Wallets
  wallets: string[];

  // Experience
  investmentExperience: "none" | "basic" | "intermediate" | "advanced";
  riskTolerance: "low" | "medium" | "high";
}

export type { UserIdentifier, UserProfile };
