interface UserIdentifier {
  id: string;
  email: string;
  password: string;
}

interface UserSecurity {
  phone: string;
  emailVerified: boolean;
  twoFactorAuth: boolean;
  twoFactorSecret: string;
  lastLogin: Date;
}

export type { UserIdentifier, UserSecurity };
