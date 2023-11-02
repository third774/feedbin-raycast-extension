import { Cache } from "@raycast/api";
import { useEffect } from "react";

export const feedbinGlobalCache = new Cache();

export function getCachedData<T>(cache: Cache, key: string) {
  const value = cache.get(key);
  return value !== undefined ? (JSON.parse(value) as T) : undefined;
}

export function useSyncCache<T>(cache: Cache, key: string, data: T) {
  useEffect(() => {
    if (data) {
      cache.set(key, JSON.stringify(data));
    } else {
      cache.remove(key);
    }
  }, [data]);
}
