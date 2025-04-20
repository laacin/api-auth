// Error types
export enum TypeErr {
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
  VALIDATION = "VALIDATION_ERROR",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  GONE = "GONE",
  INTERNAL = "INTERNAL",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
}

export class AppErr extends Error {
  protected constructor(
    public type: TypeErr,
    msg: string,
  ) {
    super(msg);
  }
}

// Error structure
export class ErrGeneric extends AppErr {
  // ---- INTERNAL ERRORS
  static internal(err: unknown): AppErr {
    console.error(err);
    return new AppErr(TypeErr.INTERNAL, String(err));
  }

  static notImplemented(): AppErr {
    return new AppErr(
      TypeErr.NOT_IMPLEMENTED,
      "This service is not implemented yet",
    );
  }

  // ---- Generic errors
  static invalidArgument(): AppErr {
    return new AppErr(TypeErr.INVALID_ARGUMENT, "Invalid argument");
  }

  static validation(): AppErr {
    return new AppErr(TypeErr.VALIDATION, "Validation error");
  }

  static unauthenticated(): AppErr {
    return new AppErr(TypeErr.UNAUTHENTICATED, "Auth required");
  }

  static forbidden(): AppErr {
    return new AppErr(TypeErr.NOT_FOUND, "Access denied");
  }

  static notFound(): AppErr {
    return new AppErr(TypeErr.NOT_FOUND, "Resource not found");
  }

  static conflict(): AppErr {
    return new AppErr(TypeErr.CONFLICT, "Resource is already exists");
  }

  static gone(): AppErr {
    return new AppErr(TypeErr.GONE, "This resource not longer exists");
  }
}
