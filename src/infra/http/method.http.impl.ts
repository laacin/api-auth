import type { Request } from "@interfaces/http/context";

export enum MethodHttp {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const isMathMethod = (req: Request, method: MethodHttp): boolean => {
  return req.method === method;
};
