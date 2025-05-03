export interface UserCacheRepository {
  // Tokens
  revokeToken(token: string): Promise<void>;
  isTokenRevoked(token: string): Promise<boolean>;
}
