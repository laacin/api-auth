import type { HashService } from "@application/services";
import { hash, compare } from "bcrypt";

export class HashServiceImpl implements HashService {
  async generate(plain: string): Promise<string> {
    return hash(plain, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
