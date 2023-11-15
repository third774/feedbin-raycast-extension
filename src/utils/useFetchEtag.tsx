import {
  CachedPromiseOptions,
  showFailureToast,
  useCachedPromise,
} from "@raycast/utils";
import { Headers, RequestInfo, RequestInit, Response } from "node-fetch";
import { fetchWithETag } from "./fetchWithETag";

export function useFetchWithEtag<T = unknown, U = undefined>(
  input: RequestInfo,
  {
    initialData,
    parseResponse,
    keepPreviousData,
    execute,
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
  const api = useCachedPromise<
    (input: RequestInfo, init: RequestInit) => Promise<T | undefined>,
    U
  >(
    async (input: RequestInfo, restFetchOptions: RequestInit) => {
      return fetchWithETag(input, restFetchOptions).then(async (res) => {
        if (res.status === 401) {
          showFailureToast("Authorization Failed");
          return undefined;
        }
        return parseResponse ? parseResponse(res) : (res.json() as Promise<T>);
      });
    },
    [input, restFetchOptions],
    {
      initialData,
      keepPreviousData,
      execute,
    },
  );

  return api;
}
