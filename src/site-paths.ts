const base = import.meta.env.BASE_URL.replace(/^\/+|\/+$/g, "");

/** Local URLs use the configured deployment base and always retain one slash. */
export const siteBasePath = base ? `/${base}/` : "/";

/** Build a URL for a route or public asset relative to this site. */
export const sitePath = (path = "") => `${siteBasePath}${path.replace(/^\/+/, "")}`;

/** Remove only this site's complete base prefix when reading a request path. */
export const siteRelativePath = (pathname: string) => {
  if (siteBasePath === "/") return pathname;
  if (pathname === siteBasePath.slice(0, -1)) return "/";
  return pathname.startsWith(siteBasePath)
    ? `/${pathname.slice(siteBasePath.length)}`
    : pathname;
};
