import type { RequestImpl } from "./request.impl";
import type { ResponseImpl } from "./response.impl";

export type ControllerImpl = (
  req: RequestImpl,
  res: ResponseImpl,
  next: () => void,
) => void | Promise<void>;
