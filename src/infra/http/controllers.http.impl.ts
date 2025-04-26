import type { Request, Response } from "@interfaces/http/context";

export type Controller = (
  req: Request,
  res: Response,
  next: () => void,
) => void;

export const execControllers = (
  req: Request,
  res: Response,
  ...controllers: Controller[]
): void => {
  let index = 0;

  const next = () => {
    if (index >= controllers.length || res.sent) return;
    const controller = controllers[index++];
    if (controller) {
      controller(req, res, next);
    }
  };

  next();
};
