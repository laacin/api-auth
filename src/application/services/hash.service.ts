export interface HashService {
  generate(): Promise<string>;
  compare(): Promise<boolean>;
}
