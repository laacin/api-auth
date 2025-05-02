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

// Error structure
export class AppErr extends Error {
  protected constructor(
    public type: TypeErr,
    msg: string,
  ) {
    super(msg);
  }

  // To HTTP
  toHttp(): [number, string] {
    switch (this.type) {
      case TypeErr.INVALID_ARGUMENT:
        return [400, this.message];

      case TypeErr.VALIDATION:
        return [400, this.message];

      case TypeErr.UNAUTHENTICATED:
        return [401, this.message];

      case TypeErr.FORBIDDEN:
        return [403, this.message];

      case TypeErr.NOT_FOUND:
        return [404, this.message];

      case TypeErr.CONFLICT:
        return [409, this.message];

      case TypeErr.GONE:
        return [410, this.message];

      case TypeErr.INTERNAL:
        return [500, "Internal server error"];

      case TypeErr.NOT_IMPLEMENTED:
        return [501, "Not implemented"];

      default:
        return [500, "Internal server error"];
    }
  }
}

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
    return new AppErr(TypeErr.FORBIDDEN, "Access denied");
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

  // ---- Token errors
  static missingToken(): AppErr {
    return new AppErr(TypeErr.FORBIDDEN, "Missing token");
  }

  static invalidToken(): AppErr {
    return new AppErr(TypeErr.FORBIDDEN, "Invalid token");
  }
}
