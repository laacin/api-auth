import type { ControllerImpl } from "../controller.impl";
import type { RequestImpl } from "../request.impl";
import type { ResponseImpl } from "../response.impl";

export const execControllers = async (
  req: RequestImpl,
  res: ResponseImpl,
  controllers: ControllerImpl[],
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
