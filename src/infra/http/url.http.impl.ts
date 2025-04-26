// URL Properties =>
type UrlProps =
  | { match: false }
  | {
      match: true;
      params: Record<string, string>;
      query: Record<string, string>;
    };

// Read URL Method
export function readUrl(absoluteUrl: string, provideUrl: string): UrlProps {
  // Check is valid URLs
  if (!absoluteUrl.startsWith("/") || !provideUrl.startsWith("/")) {
    throw new Error("Invalid URL");
  }

  // Split URLs
  const absoluteSplit = absoluteUrl.slice(1).split("/");
  const provideSplit = provideUrl.slice(1).split("/");

  // Query and parameters container
  const params: Record<string, string> = {};
  const query: Record<string, string> = {};

  // Check if match
  if (absoluteSplit.length !== provideSplit.length) {
    return { match: false };
  }

  for (let i = 0; i < absoluteSplit.length; i++) {
    const absSegment = absoluteSplit[i];
    const prvSegment = provideSplit[i];
    if (!absSegment || !prvSegment) {
      throw new Error("Unexpected error reading URL");
    }

    // Save and skip parameter
    if (prvSegment?.startsWith(":")) {
      const value = absSegment.split("?")[0];
      if (value) {
        params[prvSegment.slice(1)] = value;
      }

      if (i < absoluteSplit.length - 1) continue;
    }

    // Get query if exists
    if (i === absoluteSplit.length - 1) {
      // Check final segment
      const [finalSeg, urlQuery] = absSegment.split("?");
      if (
        !finalSeg ||
        (!prvSegment.startsWith(":") && finalSeg !== prvSegment)
      ) {
        return { match: false };
      }

      // Save query if exists
      if (!urlQuery) break;

      for (const q of urlQuery.split("&")) {
        const [key, value] = q.split("=");
        if (!key || !value) continue;
        query[key] = value;
      }

      break;
    }

    // Compare segments
    if (absSegment !== prvSegment) {
      return { match: false };
    }
  }

  return { match: true, params, query };
}
