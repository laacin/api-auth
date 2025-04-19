export interface TokenService {
  newToken(id: string): Promise<string>;
  verifyToken(token: string): Promise<string>;
}
