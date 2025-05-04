import type { Controller, Request, Response } from "@interfaces/http";

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
