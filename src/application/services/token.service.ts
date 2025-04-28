import type { TokenType } from "@domain/security";

export interface TokenService {
  create(type: TokenType, id: string): Promise<string>;
  verifyToken(token: string | undefined, expected?: string): Promise<string>;
}
