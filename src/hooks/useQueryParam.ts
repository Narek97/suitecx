import { useCallback } from 'react';

import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useQueryParam = () => {
  const searchParams = useSearchParams() as ReadonlyURLSearchParams;
  const router = useRouter();
  const pathname = usePathname();

  const getQueryParamValue = useCallback(
    (query: string) => {
      return searchParams?.get(query);
    },
    [searchParams],
  );

  const setQueryParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const addNewQueryParam = useCallback(
    (name: string, value: string) => {
      router.push(pathname + '?' + setQueryParam(name, value));
    },
    [setQueryParam, pathname, router],
  );

  const createQueryParam = useCallback(
    (name: string, value: string) => {
      router.push(pathname + '?' + name + '=' + value);
    },
    [pathname, router],
  );

  const removeQueryParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);

      return params.toString();
    },
    [searchParams],
  );

  const deleteQueryParam = useCallback(
    (name: string) => {
      router.push(pathname + '?' + removeQueryParam(name));
    },
    [removeQueryParam, pathname, router],
  );

  const removeQueryParams = useCallback(() => {
    router.push(pathname || '/');
  }, [pathname, router]);

  return {
    getQueryParamValue,
    createQueryParam,
    deleteQueryParam,
    removeQueryParams,
    addNewQueryParam,
  };
};
