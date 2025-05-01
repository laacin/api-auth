import type { Request, Response, Controller } from "@interfaces/http";
import { isMatchMethod, MethodHttp } from "./method.http.impl";
import { execControllers } from "./controllers.http.impl";
import { isMatchUrl, setUrlProperties } from "./url.http.impl";

interface Endpoint {
  method: MethodHttp;
  controllers: Controller[];
}

const checkPath = (path?: string): void => {
  if (path) {
    if (!path.startsWith("/") || path.endsWith("/")) {
      throw new Error(
        "Error: Path must start with '/' and must not end with '/'",
      );
    }

    if (path.includes("?")) {
      throw new Error("Error: Invalid path");
    }
  }
};

export class Router {
  readonly basePath: string;
  private readonly subRouters: Router[] = [];
  private readonly routes = new Map<string, Endpoint[]>();
  private readonly middlewares: Controller[] = [];
  private readonly globalMiddlewares: Controller[];

  private constructor(
    private readonly req: Request,
    private readonly res: Response,
    basePath?: string,
    ...middlewares: Controller[]
  ) {
    this.basePath = basePath ?? "";
    this.globalMiddlewares = middlewares;
  }

  static create(
    req: Request,
    res: Response,
    basePath?: string,
    ...globalMiddlewares: Controller[]
  ): Router {
    checkPath(basePath);
    return new Router(req, res, basePath, ...globalMiddlewares);
  }

  // Sub Router
  subRouter(path: string, ...controllers: Controller[]): Router {
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
    ...controllers: Controller[]
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

  logger(): void {
    for (const routes of this.routes) {
      const [a] = routes;
      console.log(a);
    }
    for (const sub of this.subRouters) {
      sub.routes.forEach((_v, k) => {
        console.log(k);
      });
    }
  }

  // Handle request
  async execute(): Promise<void> {
    // Check if is already sent
    if (this.res.sent) return;

    // Global middleware
    if (this.globalMiddlewares.length > 0) {
      await execControllers(this.req, this.res, this.globalMiddlewares);
      if (this.res.sent) return;
    }

    // Routes
    for (const [path, endpoints] of this.routes) {
      // Check URL
      if (!isMatchUrl(this.req, path)) continue;

      // Middleware
      await execControllers(this.req, this.res, this.middlewares);
      if (this.res.sent) return;

      // Check method
      for (const end of endpoints) {
        if (isMatchMethod(this.req, end.method)) {
          // Matched! setup controllers =>
          setUrlProperties(this.req, path);
          await execControllers(this.req, this.res, end.controllers);
          return;
        }
      }

      // 405 Error
      this.res.sendError(405, "Not method allowed");
      return;
    }

    // Exec sub routers
    for (const sub of this.subRouters) {
      if (!this.res.sent) await sub.execute();
    }

    if (!this.res.sent) {
      this.res.sendError(404, "Not found");
    }
  }
}
