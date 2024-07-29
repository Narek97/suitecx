import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

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

  const createQueryParam = useCallback(
    (name: string, value: string) => {
      router.push(pathname + '?' + setQueryParam(name, value));
    },
    [setQueryParam, pathname, router],
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
    setQueryParam,
    createQueryParam,
    deleteQueryParam,
    removeQueryParams,
  };
};
