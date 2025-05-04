import type {
  ClientContext,
  ClientDevice,
  ClientUser,
  Request,
} from "@interfaces/http";
import type { IncomingMessage } from "node:http";
import { ErrGeneric } from "@domain/errs";
import { bodyParser } from "./framework";

interface Tokens {
  bearerAuth?: string;
  cookieAuth?: string;
  deviceToken?: string;
}

export class RequestImpl implements Request {
  constructor(private readonly req: IncomingMessage) {
    // Set URL
    this.url = {
      path: req.url ?? "/",
    };
    this.method = req.method ?? "GET";

    // Set context
    const { auth_token, device_token } = parseCookies(req.headers.cookie ?? "");
    this.tokens = {
      bearerAuth: req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined,
      cookieAuth: auth_token,
      deviceToken: device_token,
    };
    this.client.device = {
      userId: "",
      deviceId: "",
      deviceName: "",
      userAgent: req.headers["user-agent"],
    };
  }

  // Inherit
  client: ClientContext = {};
  url: {
    path: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  method: string;

  async body(): Promise<Record<string, unknown>> {
    try {
      return await bodyParser(this.req);
    } catch {
      throw ErrGeneric.invalidArgument();
    }
  }

  // Extras
  tokens: Tokens = {};
  setter: Setter = new Setter(this);
}

// Helpers
const parseCookies = (rawCookie: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  for (const part of rawCookie.split(";")) {
    const [key, value] = part.trim().split("=");
    if (!key || !value) continue;
    cookies[key] = value;
  }

  return cookies;
};

class Setter {
  constructor(private readonly req: Request) {}

  user(user: ClientUser) {
    this.req.client.user = user;
  }

  device(device: ClientDevice) {
    this.req.client.device = device;
  }
}
