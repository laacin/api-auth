import type { Request } from "@interfaces/http/context";

// URL Properties =>
type UrlProps =
  | { match: false }
  | {
      match: true;
      params: Record<string, string>;
      query: Record<string, string>;
    };

// Read URL Method
function readUrl(
  absoluteUrl: string,
  provideUrl: string,
  getParameters: false,
): boolean;
function readUrl(
  absoluteUrl: string,
  provideUrl: string,
  getParameters: true,
): UrlProps;
function readUrl(
  absoluteUrl: string,
  provideUrl: string,
  getParameters: boolean,
): boolean | UrlProps {
  // Check is valid URLs
  if (!absoluteUrl.startsWith("/") || !provideUrl.startsWith("/")) {
    throw new Error("Invalid URL");
  }

  // Split URLs
  const absoluteSplit = absoluteUrl.slice(1).split("/");
  const provideSplit = provideUrl.slice(1).split("/");

  // Check if match
  if (absoluteSplit.length !== provideSplit.length) {
    return getParameters ? { match: false } : false;
  }
  const len = absoluteSplit.length;

  for (let i = 0; i < len; i++) {
    const [absolute, provide] = pathSegments(i, absoluteSplit, provideSplit);

    // Skip parameter
    if (provide.startsWith(":")) continue;

    // Compare segments
    if (absolute.split("?")[0] !== provide) {
      return getParameters ? { match: false } : false;
    }
  }

  if (!getParameters) return true;

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

  return { match: true, params, query };
}

export const isMatchUrl = (
  req: Request,
  path: string,
  bindParameters?: boolean,
): boolean => {
  if (!bindParameters) return readUrl(req.url.path, path, false);

  const result = readUrl(req.url.path, path, true);
  if (!result.match) return false;

  req.url.params = result.params;
  req.url.query = result.query;
  return true;
};

// Helpers
const pathSegments = (
  iteration: number,
  absolutePath: string[],
  providePath: string[],
): [string, string] => {
  const abs = absolutePath[iteration];
  const prv = providePath[iteration];

  if (!abs || !prv) {
    throw new Error("Unexpected error reading URL");
  }

  return [abs, prv];
};

export { readUrl };
