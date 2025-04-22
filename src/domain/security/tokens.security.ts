export enum TokenType {
  AUTHENTICATION = "AUTHENTICATION",
  EMAIL_VALIDATION = "EMAIL_VALIDATION",
  PASSWORD_RECOVERY = "PASSWORD_RECOVERY",
}

export interface TokenPayload {
  type: TokenType;
  id: string;
}
