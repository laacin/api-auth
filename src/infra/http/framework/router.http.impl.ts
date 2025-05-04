import { isMatchMethod, MethodHttp } from "./method.http.impl";
import { execControllers } from "./controllers.http.impl";
import { checkPath, isMatchUrl, setUrlProperties } from "./url.http.impl";
import type { RequestImpl } from "../request.impl";
import type { ResponseImpl } from "../response.impl";
import type { ControllerImpl } from "../controller.impl";

interface Endpoint {
  method: MethodHttp;
  controllers: ControllerImpl[];
}

export class Router {
  readonly basePath: string;
  private readonly subRouters: Router[] = [];
  private readonly routes = new Map<string, Endpoint[]>();
  private readonly middlewares: ControllerImpl[] = [];
  private readonly globalMiddlewares: ControllerImpl[];

  private constructor(
    private readonly req: RequestImpl,
    private readonly res: ResponseImpl,
    basePath?: string,
    ...middlewares: ControllerImpl[]
  ) {
    this.basePath = basePath ?? "";
    this.globalMiddlewares = middlewares;
  }

  static create(
    req: RequestImpl,
    res: ResponseImpl,
    basePath?: string,
    ...globalMiddlewares: ControllerImpl[]
  ): Router {
    checkPath(basePath);
    return new Router(req, res, basePath, ...globalMiddlewares);
  }

  // Sub Router
  subRouter(path: string, ...controllers: ControllerImpl[]): Router {
    checkPath(path);
    const sub = new Router(this.req, this.res, this.basePath + path);
    sub.middlewares.push(...controllers);
    this.subRouters.push(sub);
    return sub;
  }

  // REGISTER
  private registerRoute(
    method: MethodHttp,
    path: string,
    ...controllers: ControllerImpl[]
  ): void {
    const routePath = this.basePath + path;
    checkPath(path);
    if (this.routes.has(routePath)) {
      const endpoints = this.routes.get(routePath);
      endpoints?.push({ method, controllers });
    } else {
      this.routes.set(routePath, [{ method, controllers }]);
    }
  }

  // Methods
  post(path: string, ...controllers: ControllerImpl[]): void {
    this.registerRoute(MethodHttp.POST, path, ...controllers);
  }

  get(path: string, ...controllers: ControllerImpl[]): void {
    this.registerRoute(MethodHttp.GET, path, ...controllers);
  }

  put(path: string, ...controllers: ControllerImpl[]): void {
    this.registerRoute(MethodHttp.PUT, path, ...controllers);
  }

  patch(path: string, ...controllers: ControllerImpl[]): void {
    this.registerRoute(MethodHttp.PATCH, path, ...controllers);
  }

  delete(path: string, ...controllers: ControllerImpl[]): void {
    this.registerRoute(MethodHttp.DELETE, path, ...controllers);
  }

  // Handle request
  private async handle(): Promise<boolean> {
    // Check if is already sent
    if (this.res.sent) return true;

    // Global middleware
    if (this.globalMiddlewares.length > 0) {
      await execControllers(this.req, this.res, this.globalMiddlewares);
      if (this.res.sent) return true;
    }

    // Routes
    for (const [path, endpoints] of this.routes) {
      // Check URL
      if (!isMatchUrl(this.req, path)) continue;

      // Middleware
      await execControllers(this.req, this.res, this.middlewares);
      if (this.res.sent) return true;

      // Check method
      for (const end of endpoints) {
        if (isMatchMethod(this.req, end.method)) {
          // Matched! setup controllers =>
          setUrlProperties(this.req, path);
          await execControllers(this.req, this.res, end.controllers);
          return true;
        }
      }

      // 405 Error
      this.res.sendError(405, "Not method allowed");
      return true;
    }

    // Exec sub routers
    for (const sub of this.subRouters) {
      if (await sub.handle()) return true;
    }

    return false;
  }

  private checkHandle(handle: boolean): void {
    if (!handle) {
      this.res.sendError(404, "Not found");
    }
  }

  async execute(): Promise<void> {
    this.checkHandle(await this.handle());
  }
}
