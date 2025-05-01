import { AppErr, ErrGeneric } from "@domain/errs";
import { IncomingMessage, type ServerResponse } from "node:http";
import { bodyParser } from "./body-parser.http.impl";
import type { Request, Response } from "@interfaces/http";

export class RequestImpl implements Request {
  token: string | undefined;
  url: {
    path: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  method: string;
  userId: string = "";

  constructor(private req: IncomingMessage) {
    this.url = {
      path: req.url?.startsWith("/") ? req.url : "/",
    };
    this.method = req.method ?? "";
    this.token = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : undefined;
  }

  async body(): Promise<Record<string, unknown>> {
    return bodyParser(this.req);
  }

  setUser(id: string): void {
    this.userId = id;
  }
}

export class ResponseImpl implements Response {
  constructor(private readonly res: ServerResponse) {}
  sent: boolean = false;

  sendSuccess(status: number, data?: unknown, message?: string): void {
    if (this.sent) return;
    this.sent = true;

    if (!data) {
      sendJson(this.res, status, { status });
      return;
    }

    if (typeof data === "string") {
      sendJson(this.res, status, { status, message: data });
      return;
    }

    if (!message) {
      sendJson(this.res, status, { status, data });
      return;
    }

    sendJson(this.res, status, { status, data, message });
  }

  sendError(status: number, message: string): void {
    if (this.sent) return;
    this.sent = true;

    sendJson(this.res, status, { status, error: message });
  }

  sendThrow(err: unknown): void {
    if (this.sent) return;
    this.sent = true;

    const appErr =
      err instanceof AppErr ? err : ErrGeneric.internal(String(err));
    const [status, msg] = appErr.toHttp();
    sendJson(this.res, status, { status, error: msg });
  }
}

// Helpers
const sendJson = (res: ServerResponse, status: number, msg: unknown) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(msg));
};
