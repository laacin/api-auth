// Regex
export const patterns = {
  email: /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/,
} as const;

// Field rules
interface Rules {
  name: string;
  type: unknown;
  optional?: boolean;
  minSize?: number;
  maxSize?: number;
  pattern?: RegExp[];
}

// Object rules
type ObjectRules = Record<string, Rules>;

type RulesFor<T> = Partial<Record<keyof T, Rules>>;

export type { Rules, ObjectRules, RulesFor };
