import { AppErr, TypeErr } from "./err";

export class ErrUserAuth extends AppErr {
  // ---- Authentication error
  static invalidField(msg: string): AppErr {
    return new AppErr(TypeErr.VALIDATION, msg);
  }

  static invalidAuth(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Invalid user or password");
  }

  static required2FA(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Two factor auth is required");
  }

  static invalid2FA(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Invalid 2FA code");
  }

  static notEnabled2FA(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "2FA is not enabled");
  }

  static authExpired(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Auth expired");
  }

  static emailExists(): AppErr {
    return new AppErr(TypeErr.CONFLICT, "Email is already used");
  }

  static IdentityNumberExists(): AppErr {
    return new AppErr(
      TypeErr.CONFLICT,
      "An account with this Identity number is already active",
    );
  }

  static phoneExists(): AppErr {
    return new AppErr(
      TypeErr.CONFLICT,
      "This phone number is already registered",
    );
  }
}
