import type { RequestImpl } from "../request.impl";

export enum MethodHttp {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const isMatchMethod = (
  req: RequestImpl,
  method: MethodHttp,
): boolean => {
  return req.method === method;
};
