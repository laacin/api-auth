import { AppErr, ErrGeneric } from "@domain/errs";
import type { Request, Response } from "@interfaces/http/context";
import type {
  Request as RequestExpress,
  Response as ResponseExpress,
} from "express";

export class RequestImpl implements Request {
  constructor(req: RequestExpress) {
    this.url = {
      path: req.url,
      params: req.params,
      query: req.query as Record<string, string> | undefined,
    };
    this.method = req.method;
    this.body = req.body;
  }

  url: {
    path: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  method: string;
  userId: string = "";
  body: Record<string, unknown>;
}

export class ResponseImpl implements Response {
  constructor(private readonly res: ResponseExpress) {}
  sent?: boolean | undefined;

  sendSuccess(status: number, data?: unknown, message?: string): void {
    this.sent = true;
    const chainRes = this.res.status(status);

    if (!data) {
      chainRes.json({ status });
      return;
    }

    if (typeof data === "string") {
      chainRes.json({ status, message: data });
      return;
    }

    if (!message) {
      chainRes.json({ status, data });
      return;
    }

    chainRes.json({ status, data, message });
  }

  sendError(status: number, message: string): void {
    this.sent = true;
    this.res.status(status).json({ status, error: message });
  }

  sendThrow(err: unknown): void {
    const appErr =
      err instanceof AppErr ? err : ErrGeneric.internal(String(err));
    const [status, msg] = appErr.toHttp();
    this.res.status(status).json({ status, error: msg });
  }
}
