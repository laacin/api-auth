export interface IdService {
  create(): string;
  verify(id: string): boolean;
}
