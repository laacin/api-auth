import type { IdService } from "@application/services";
import { v4 } from "uuid";

export class IdServiceImpl implements IdService {
  create(): string {
    return v4();
  }

  verify(): boolean {
    return true;
  }
}
