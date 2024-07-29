// import { AxiosRequestHeaders } from "axios";

// interface UseQueryFn<TData, TVariables> {
//   (variables: TVariables, options?: UseMutationOptions<TData>): unknown;
//   document: string;
//   getKey: (variables?: TVariables) => unknown[];
// }

// export const useMutationWithHeader = <TData, TVariables>(
//   document: string,
//   getKey: (variables?: TVariables) => unknown[],
//   headers?: Record<string, any>,
//   options?: UseMutationOptions<TData, Error, TVariables>,
// ) => useMutation<TData, Error, TVariables>(getKey(), axiosRequest(document, headers), options);
