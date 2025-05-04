import type { RequestImpl } from "../request.impl";

// Read URL Method
export const isMatchUrl = (req: RequestImpl, path: string): boolean => {
  // Check is valid URLs
  if (!req.url.path.startsWith("/")) {
    throw new Error("Invalid request URL");
  }

  checkPath(path);

  // Split URLs
  const absoluteSplit = req.url.path.slice(1).split("/");
  const provideSplit = path.slice(1).split("/");

  // Check if match
  if (absoluteSplit.length !== provideSplit.length) {
    return false;
  }
  const len = absoluteSplit.length;

  for (let i = 0; i < len; i++) {
    const [absolute, provide] = pathSegments(i, absoluteSplit, provideSplit);

    // Skip parameter
    if (provide.startsWith(":")) continue;

    // Compare segments
    if (absolute.split("?")[0] !== provide) {
      return false;
    }
  }

  return true;
};

export const setUrlProperties = (req: RequestImpl, path: string): void => {
  // Split URLs
  const absoluteSplit = req.url.path.slice(1).split("/");
  const provideSplit = path.slice(1).split("/");
  const len = absoluteSplit.length;

  // Query and parameters container
  const params: Record<string, string> = {};
  const query: Record<string, string> = {};

  // Save Parameters
  for (let i = 0; i < len; i++) {
    const [absolute, provide] = pathSegments(i, absoluteSplit, provideSplit);

    // Params
    if (provide.startsWith(":")) {
      if (i === len - 1) {
        params[provide.slice(1)] = absolute.split("?")[0] ?? "";
      } else {
        params[provide.slice(1)] = absolute;
      }
    }

    // Query
    if (i === len - 1) {
      const urlQuery = absolute.split("?")[1];
      if (!urlQuery) continue;

      const keyValues = urlQuery.split("&");
      for (const kv of keyValues) {
        const [key, value] = kv.split("=");
        if (key && value) {
          query[key] = value;
        }
      }
    }
  }

  req.url.params = params;
  req.url.query = query;
};

export const checkPath = (path?: string): void => {
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

// Helpers
const pathSegments = (
  iteration: number,
  absolutePath: string[],
  providePath: string[],
): [string, string] => {
  const abs = absolutePath[iteration];
  const prv = providePath[iteration];

  if (abs === undefined || prv === undefined) {
    throw new Error("Unexpected error reading URL");
  }

  return [abs, prv];
};
