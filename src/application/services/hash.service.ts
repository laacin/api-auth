export interface HashService {
  generate(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
