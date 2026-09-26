// URL fragments stay in the browser and are not sent in HTTP request targets.
export function lineLinkUrl(origin: string, linkToken: string): string {
  const url = new URL(origin);
  url.pathname = "/";
  url.search = "";
  url.hash = new URLSearchParams({ linkToken }).toString();
  return url.toString();
}

export function consumeLineLinkUrl(href: string): {
  token: string;
  cleanPath: string;
} {
  const url = new URL(href);
  const token = new URLSearchParams(url.hash.slice(1)).get("linkToken") || "";
  // Legacy query tokens are stripped, never consumed. Request a fresh LINE link.
  url.searchParams.delete("linkToken");
  return { token, cleanPath: url.pathname + url.search };
}
