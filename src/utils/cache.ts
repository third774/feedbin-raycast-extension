import { Cache } from "@raycast/api";
import { useFetch } from "@raycast/utils";

export const feedbinGlobalCache = new Cache();

export function getCachedData<T>(cache: Cache, key: string) {
  const value = cache.get(key);
  return value !== undefined ? (JSON.parse(value) as T) : undefined;
}

export function useCachedFetch<T>(
  ...[requestInfo, options]: Parameters<typeof useFetch<T, T | undefined>>
) {
  const url = typeof requestInfo === "string" ? requestInfo : requestInfo.url;

  const api = useFetch<T, T | undefined>(url, {
    ...options,
    initialData:
      options?.initialData ??
      getCachedData<T>(feedbinGlobalCache, url.toString()),
    onData: (data) => {
      feedbinGlobalCache.set(url, JSON.stringify(data));
    },
  });

  return api;
}
