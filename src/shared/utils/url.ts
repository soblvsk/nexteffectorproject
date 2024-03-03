import type { ParsedUrlQuery } from "node:querystring";
import type { UrlObject } from "node:url";

/**
 * Returns the pathname of the URL object, which is the root-relative URL
 * Root means that pathname starts with /
 * Can be used to construct url path from params segments in SSG/SSR next.js functions
 */
export function getRootRelativeURL(url?: string | string[]) {
  // Create a base URL with a dummy domain to construct a proper URL later
  const baseURL = "http://dummy-domain.com";

  if (!url) {
    return "/";
  }

  if (Array.isArray(url)) {
    const urlSegments = url;

    // Filter empty and whitespace-only segments
    const cleanSegments = urlSegments.filter((v) => v.trim() !== "");

    // Join the clean segments with '/' and create a URL object
    const urlString = `/${cleanSegments.join("/")}`;
    const fullURL = new URL(urlString, baseURL);

    // Return the pathname of the URL object, which is the root-relative URL
    return fullURL.pathname;
  }

  // Construct a URL object with the input url and the base URL
  const fullURL = new URL(url, baseURL);

  // Return the pathname of the URL object, which is the root-relative URL
  return fullURL.pathname;
}

// Next.js uses UrlObject for router.push `url`
// See: https://nextjs.org/docs/api-reference/next/router#routerpush
export function getUrlWithoutOriginFromUrlObject(url: UrlObject): string {
  const urlWithoutOrigin = [url.pathname, url.search, url.hash]
    .filter(Boolean)
    .join("");
  return urlWithoutOrigin.replace(/^([^/])/, "/$1");
}

// For modern URL spec.
export function getUrlWithoutOriginFromURL(url: URL): string {
  const urlString = url.toString();
  return urlString.slice(url.origin.length).replace(/^([^/])/, "/$1");
}

export function searchParamsToUrlQuery(
  searchParams: URLSearchParams,
): ParsedUrlQuery {
  const query: ParsedUrlQuery = {};
  searchParams.forEach((value, key) => {
    if (typeof query[key] === "undefined") {
      query[key] = value;
    } else if (Array.isArray(query[key])) {
      (query[key] as string[]).push(value);
    } else {
      query[key] = [query[key] as string, value];
    }
  });
  return query;
}

function stringifyUrlQueryParam(param: unknown): string {
  if (
    typeof param === "string" ||
    (typeof param === "number" && !Number.isNaN(param)) ||
    typeof param === "boolean"
  ) {
    return String(param);
  }
  return "";
}

export function urlQueryToSearchParams(
  urlQuery: ParsedUrlQuery,
): URLSearchParams {
  const result = new URLSearchParams();
  Object.entries(urlQuery).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => result.append(key, stringifyUrlQueryParam(item)));
    } else {
      result.set(key, stringifyUrlQueryParam(value));
    }
  });
  return result;
}

export function assignToSearchParams(
  target: URLSearchParams,
  ...searchParamsList: URLSearchParams[]
): URLSearchParams {
  searchParamsList.forEach((searchParams) => {
    Array.from(searchParams.keys()).forEach((key) => target.delete(key));
    searchParams.forEach((value, key) => target.append(key, value));
  });
  return target;
}

export function stripLeadingSlash(pth: string): string {
  return pth.startsWith("/") ? pth.slice(1) : pth;
}

export const isFilePath = (pth: string) => {
  const url = new URL(pth);
  const urlPathname = url.pathname ?? "";
  const parts = urlPathname.split("/");
  const lastPart = parts.pop();

  if (!lastPart) return false;

  return lastPart.indexOf(".") > 0;
};

export const getPathWithoutQueryAndHash = (pth: string): string => {
  return pth.replace(/(\?.*)|(#.*)/g, "");
};

export const searchStringObj = (searchString: string) => {
  return searchString
    .split("&")
    .reduce((result: { [key: string]: string }, item: string) => {
      const parts = item.split("=");
      const key = decodeURIComponent(parts[0]);
      const value = decodeURIComponent(parts[1]);
      result[key] = value;
      return result;
    }, {});
};

export const getLastUrlSegment = (url: string) =>
  getRootRelativeURL(url).split("/").filter(Boolean).pop() || "";
