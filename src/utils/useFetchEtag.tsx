import { Cache } from "@raycast/api";
import { CachedPromiseOptions, useCachedPromise } from "@raycast/utils";
import fetch, { Headers, Request, RequestInfo, Response } from "node-fetch";

export const etagCache = new Cache({ namespace: "feedbin-etags" });

interface EtagCacheEntry<T> {
  etag: string;
  lastModified: string;
  data: T;
}

function storeEtagCacheEntry<T>(
  url: string,
  eTagCacheEntry: EtagCacheEntry<T>,
) {
  const newEtagCached = JSON.stringify(eTagCacheEntry);
  etagCache.set(url, newEtagCached);
}

function getEtagCacheEntry<T>(url: string): EtagCacheEntry<T> | null {
  const previousEtagCached = etagCache.get(url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return previousEtagCached ? (JSON.parse(previousEtagCached) as any) : null;
}

export function useFetchWithEtag<T = unknown, U = undefined>(
  input: RequestInfo,
  {
    initialData,
    parseResponse,
    keepPreviousData,
    execute,
    headers,
    ...restFetchOptions
  }: Omit<RequestInit, "headers"> & {
    headers?: Headers | Record<string, string>;
    parseResponse?: (response: Response) => Promise<T>;
  } & Omit<
      CachedPromiseOptions<
        (url: RequestInfo, options?: RequestInit) => Promise<T>,
        U
      >,
      "abortable"
    > = {},
) {
  const url = input instanceof Request ? input.url : input.toString();
  const api = useCachedPromise<(url: string) => Promise<T>, U>(
    async (url: string) => {
      const previousEtagCacheEntry = getEtagCacheEntry<T>(url);
      const newHeaders = new Headers(headers);
      if (previousEtagCacheEntry) {
        newHeaders.set("If-None-Match", previousEtagCacheEntry.etag);
        newHeaders.set(
          "If-Modified-Since",
          previousEtagCacheEntry.lastModified,
        );
      }

      const res = await fetch(input, {
        headers: newHeaders,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(restFetchOptions as any),
      });
      if (res.status === 304 && previousEtagCacheEntry) {
        return previousEtagCacheEntry?.data;
      } else {
        const newEtag = res.headers.get("ETag");
        const newLastModified = res.headers.get("Last-Modified");
        const newData = await (parseResponse ? parseResponse(res) : res.json());
        storeEtagCacheEntry(url, {
          etag: newEtag ?? "",
          lastModified: newLastModified ?? "",
          data: newData,
        });

        return newData as T;
      }
    },
    [url],
    {
      initialData,
      keepPreviousData,
      execute,
    },
  );

  return api;
}
