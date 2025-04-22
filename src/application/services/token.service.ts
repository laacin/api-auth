import type { TokenPayload, TokenType } from "@domain/security";

export interface TokenService {
  create(type: TokenType, id: string): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}
