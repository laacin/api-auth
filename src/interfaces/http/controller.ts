import type { Request, Response } from "./context";

export type Controller = (
  req: Request,
  res: Response,
  next: () => void,
) => void | Promise<void>;
