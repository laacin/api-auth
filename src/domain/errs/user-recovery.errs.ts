import { AppErr, TypeErr } from "./err";

export class ErrUserRecovery extends AppErr {
  // ---- User recovery error
  static emailIsAlreadyVerified(): AppErr {
    return new AppErr(TypeErr.CONFLICT, "Email is already verified");
  }

  static emailVerificationExpired(): AppErr {
    return new AppErr(
      TypeErr.GONE,
      "Email verification is no longer available",
    );
  }

  static emailRecoveryExpired(): AppErr {
    return new AppErr(TypeErr.GONE, "Email recovery not longer available");
  }

  static passwordRecoveryExpired(): AppErr {
    return new AppErr(TypeErr.GONE, "Password recovery not longer available");
  }
}
