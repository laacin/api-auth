export type TokenType =
  | "access"
  | "refresh"
  | "email_validation"
  | "email_recovery"
  | "password_recovery";

// => Authentication payloads
interface AccessPayload {
  sub: string;
  email: string;
  permissions: string[];
  identity: string;
}

interface RefreshPayload {
  sub: string;
}

// => Recovery payloads
interface EmailValidationPayload {
  sub: string;
}

interface EmailRecoveryPayload {
  sub: string;
}

interface PasswordRecoveryPayload {
  sub: string;
}

interface Payload {
  access: AccessPayload;
  refresh: RefreshPayload;
  email_validation: EmailValidationPayload;
  email_recovery: EmailRecoveryPayload;
  password_recovery: PasswordRecoveryPayload;
}

export type {
  AccessPayload,
  RefreshPayload,
  EmailValidationPayload,
  EmailRecoveryPayload,
  PasswordRecoveryPayload,
  Payload,
};
