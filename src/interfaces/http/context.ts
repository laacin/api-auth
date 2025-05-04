// ---- Request context
export interface ClientUser {
  id: string;
  email: string;
  permissions: string[];
}

export interface ClientDevice {
  deviceId: string;
  deviceName: string;
  userId: string;
  userAgent?: string;
}

export interface ClientContext {
  user?: ClientUser;
  device?: ClientDevice;
}

// ---- Request
export interface Request {
  client: ClientContext;
  url: {
    path: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  method: string;
  body(): Promise<Record<string, unknown>>;
}

// ---- Response
export interface Response {
  sent: boolean;
  sendSuccess(status: number, data: unknown, message?: string): void;
  sendError(status: number, message: string): void;
  sendThrow(err: unknown): void;
}
