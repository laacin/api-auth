import type { RulesFor } from "@domain/rules/types";
import { validateField } from "./field.validation";

function validateObject<T>(
  rules: RulesFor<T>,
  target: Record<keyof T, unknown>,
): string | null {
  const keys = Object.keys(rules);

  for (const k of keys) {
    const value = target[k as keyof T];
    const rule = rules[k as keyof T];

    const err = validateField(value, rule, true);
    if (err) return err;
  }

  return null;
}

export default validateObject;
