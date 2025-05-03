import type { IdService } from "@application/services";
import { v4, validate } from "uuid";

export class IdServiceImpl implements IdService {
  create(): string {
    return v4();
  }

  verify(id: string): boolean {
    return validate(id);
  }
}
