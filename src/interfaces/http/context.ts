// ---- Request
export interface Request {
  url: {
    path: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  method: string;
  userId: string;
  setUser(id: string): void;
  body(): Promise<Record<string, unknown>>;
}

// ---- Response
export interface Response {
  sent: boolean;
  sendSuccess(status: number, data: unknown, message?: string): void;
  sendError(status: number, message: string): void;
  sendThrow(err: unknown): void;
}
