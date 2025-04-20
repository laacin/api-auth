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

  static missingToken(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Missing token");
  }

  static invalidToken(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Invalid token");
  }

  static emailExists(): AppErr {
    return new AppErr(TypeErr.CONFLICT, "Email is already used");
  }

  static idExists(): AppErr {
    return new AppErr(
      TypeErr.CONFLICT,
      "An account with this ID number is already active",
    );
  }

  static phoneExists(): AppErr {
    return new AppErr(
      TypeErr.CONFLICT,
      "This phone number is already registered",
    );
  }
}
