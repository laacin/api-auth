import { AppErr, TypeErr } from "./err";

export class ErrUserRecovery extends AppErr {
  // ---- User recovery error
  static emailRecoveryExpired(): AppErr {
    return new AppErr(TypeErr.GONE, "Email recovery not longer available");
  }

  static emailIsAlreadyVerified(): AppErr {
    return new AppErr(TypeErr.CONFLICT, "Email is already verified");
  }

  static passwordRecoveryExpired(): AppErr {
    return new AppErr(TypeErr.GONE, "Password recovery not longer available");
  }
}
