export interface TokenService {
  idToken(id: string): Promise<string>;
  verifyIdToken(id: string): Promise<string>;
}
