import { validateField } from "@application/validations/field.validation";
import validateObject from "@application/validations/object.validation";
import type { UserIdentifier } from "@domain/entities";
import { ErrUserAuth } from "@domain/errs";
import { patterns, type ObjectRules } from "@domain/rules/types";

export class LoginDto {
  private constructor(public identifier: Partial<UserIdentifier>) {}

  static create(data: Record<string, unknown>): LoginDto {
    // Get user identifier
    const { identifier, password } = data;
    const err = validateObject(rulesDto, { identifier, password });
    if (err) throw ErrUserAuth.invalidField(err);

    // Check identifier
    let u: Partial<UserIdentifier>;
    if (isEmail(identifier as string)) {
      u = {
        email: identifier as string,
        password: password as string,
      };
    } else {
      u = {
        identityNumber: identifier as string,
        password: password as string,
      };
    }

    return new LoginDto(u);
  }
}

// Validation
const isEmail = (target: string): boolean => {
  return validateField(target, {
    name: "",
    type: "",
    pattern: [patterns.email],
  });
};

const rulesDto: ObjectRules = {
  identifier: {
    name: "email or identity number",
    type: "",
    minSize: 2,
    maxSize: 40,
  },

  password: {
    name: "password",
    type: "",
    minSize: 2,
    maxSize: 40,
  },
};
