'use client';
import React, { FC } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface IRecoilProvider {
  children: React.ReactNode;
}

export const gqlGlobalOptions = {
  queryCache: new QueryCache({}),
  useErrorBoundary: true,
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: async (error: any) => {
        console.log(error);
      },
    },
    mutations: {
      onError: async (error: any) => {
        console.log(error);
      },
    },
  },
};

export const queryClient = new QueryClient(gqlGlobalOptions);

const ReactQueryProvider: FC<IRecoilProvider> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
