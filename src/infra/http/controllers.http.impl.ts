import type { Request, Response } from "@interfaces/http/context";

export type Controller = (
  req: Request,
  res: Response,
  next: () => void,
) => void | Promise<void>;

export const execControllers = async (
  req: Request,
  res: Response,
  controllers: Controller[],
): Promise<void> => {
  let index = 0;

  const next = async () => {
    if (index >= controllers.length || res.sent) return;
    const controller = controllers[index++];
    if (controller) {
      await controller(req, res, next);
    }
  };

  next();
};
