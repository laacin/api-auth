import type { Rules } from "@domain/entities/types";

function validateField(target: unknown, rules?: Rules, info?: false): boolean;
function validateField(
  target: unknown,
  rules?: Rules,
  info?: true,
): string | null;
function validateField(
  target: unknown,
  rules?: Rules,
  info?: boolean,
): boolean | string | null {
  // Check rules
  if (!rules) return info ? null : true;

  // Check if Target exists
  if (target === undefined) {
    if (!rules.optional) {
      return info ? `Missing ${rules.name}` : false;
    }

    return info ? null : true;
  }

  // Check if is Date
  if (rules.type === "date") {
    const date = new Date(target as string);
    if (Number.isNaN(date.getTime())) {
      return info ? `Invalid ${rules.name}` : false;
    }

    return info ? null : true;
  }

  // Check types
  if (typeof target !== "string" && typeof target !== "number") {
    if (typeof target !== typeof rules.type) {
      return info ? `Invalid ${rules.name}` : false;
    }

    return info ? null : true;
  }
  if (typeof target !== typeof rules.type) {
    return info ? `Invalid ${rules.name}` : false;
  }

  // Check pattern
  if (rules.pattern && rules.pattern.length > 0) {
    for (const p of rules.pattern) {
      if (typeof target !== "string" || !p.test(target)) {
        return info
          ? `${rules.name} does not match the required pattern`
          : false;
      }
    }
  }

  // Check length
  const len = typeof target === "string" ? target.length : target;

  if (rules.minSize && len < rules.minSize) {
    return info ? `${rules.name} is too short` : false;
  }

  if (rules.maxSize && len > rules.maxSize) {
    return info ? `${rules.name} is too long` : false;
  }

  // All ok
  return info ? null : true;
}

export default validateField;
