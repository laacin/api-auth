import type { Request, Response } from "@interfaces/http/context";
import { isMatchMethod, MethodHttp } from "./method.http.impl";
import { execControllers, type Controller } from "./controllers.http.impl";
import { isMatchUrl, setUrlProperties } from "./url.http.impl";

interface Endpoint {
  method: MethodHttp;
  controllers: Controller[];
}

export class Router {
  private readonly subRouters: Router[] = [];
  private readonly routes = new Map<string, Endpoint[]>();

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
    const absPath = this.mainPath + path;
    if (this.routes.has(absPath)) {
      const endpoints = this.routes.get(absPath);
      endpoints?.push({ method, controllers });
    } else {
      this.routes.set(absPath, [{ method, controllers }]);
    }
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

  // Handle request
  execute(): void {
    // Check if is already sent
    if (this.res.sent) return;

    // Middlewares
    execControllers(this.req, this.res, this.middlewares);

    // Routes
    for (const [path, endpoints] of this.routes) {
      // Check URL
      if (!isMatchUrl(this.req, path)) continue;

      // Check method
      for (const end of endpoints) {
        if (isMatchMethod(this.req, end.method)) {
          // Matched! setup controllers =>
          setUrlProperties(this.req, path);
          execControllers(this.req, this.res, end.controllers);
          return;
        }
      }

      // 405 Error
      this.res.sendError(405, "Not method allowed");
      return;
    }

    // Exec sub routers
    for (const sub of this.subRouters) {
      sub.execute();
    }

    this.res.sendError(404, "Not found");
  }
}
