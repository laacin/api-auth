import type { Payload } from "@domain/security";

export interface TokenService {
  // Sign
  create<T extends Payload, K extends keyof T>(
    type: K,
    payload: T[K],
  ): Promise<string>;

  // Verify
  verifyToken<T extends Payload, K extends keyof T>(
    token: string | undefined,
    expected?: K,
  ): Promise<T[K]>;
}
