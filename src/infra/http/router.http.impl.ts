import type { Request, Response } from "@interfaces/http/context";
import { isMathMethod, MethodHttp } from "./method.http.impl";
import { execControllers, type Controller } from "./controllers.http.impl";
import { isMatchUrl } from "./url.http.impl";

interface Route {
  path: string;
  method: MethodHttp;
  controllers: Controller[];
}

export class Router {
  private readonly subRouters: Router[] = [];
  private readonly routes: Route[] = [];

  private constructor(
    private readonly req: Request,
    private readonly res: Response,
    private mainPath: string = "",
    private middlewares: Controller[],
  ) {}

  static create(
    req: Request,
    res: Response,
    ...middlewares: Controller[]
  ): Router {
    return new Router(req, res, "", middlewares);
  }

  // Sub Router
  subRouter(path: string, ...controllers: Controller[]): Router {
    const sub = new Router(
      this.req,
      this.res,
      this.mainPath + path,
      controllers,
    );
    this.subRouters.push(sub);
    return sub;
  }

  // REGISTER
  private registerRoute(
    method: MethodHttp,
    path: string,
    ...controllers: Controller[]
  ): void {
    const route: Route = {
      path: this.mainPath + path,
      method: method,
      controllers: controllers,
    };
    this.routes.push(route);
  }

  // Middleware method
  use(...middlewares: Controller[]): void {
    this.middlewares.push(...middlewares);
  }

  // Methods
  post(path: string, ...controllers: Controller[]): void {
    this.registerRoute(MethodHttp.POST, path, ...controllers);
  }

  get(path: string, ...controllers: Controller[]): void {
    this.registerRoute(MethodHttp.GET, path, ...controllers);
  }

  put(path: string, ...controllers: Controller[]): void {
    this.registerRoute(MethodHttp.PUT, path, ...controllers);
  }

  patch(path: string, ...controllers: Controller[]): void {
    this.registerRoute(MethodHttp.PATCH, path, ...controllers);
  }

  delete(path: string, ...controllers: Controller[]): void {
    this.registerRoute(MethodHttp.DELETE, path, ...controllers);
  }

  private handle(): boolean {
    // Check if is already sent
    if (this.res.sent) return true;

    // Middlewares
    execControllers(this.req, this.res, this.middlewares);

    // Routes
    for (const route of this.routes) {
      if (!isMathMethod(this.req, route.method)) continue;
      if (!isMatchUrl(this.req, route.path)) continue;
      execControllers(this.req, this.res, route.controllers);
    }

    for (const sub of this.subRouters) {
      if (sub.handle()) return true;
    }

    return false;
  }

  private notMatch(): void {
    for (const route of this.routes) {
      if (isMatchUrl(this.req, route.path, false)) {
        this.res.sendError(405, "Method not allowed");
        return;
      }

      this.res.sendError(404, "Not found");
    }
  }

  execute(): void {
    if (!this.handle()) this.notMatch();
  }
}
