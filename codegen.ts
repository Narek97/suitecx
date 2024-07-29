import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  watch: false,
  overwrite: true,
  generates: {
    'src/gql/types.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: true,
      },
    },
    'src/gql/mutations/': {
      documents: 'src/gql/mutations/*.graphql',
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '../types.ts',
        folder: 'generated',
      },
      plugins: ['typescript-operations', 'typescript-react-query'],
      config: {
        exposeMutationKeys: true,
        fetcher: {
          func: '../../axiosRequest#axiosRequest',
          isReactHook: true,
        },
      },
    },
    'src/gql/queries/': {
      documents: 'src/gql/queries/*.graphql',
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '../types.ts',
        folder: 'generated',
      },
      plugins: ['typescript-operations', 'typescript-react-query'],
      config: {
        exposeQueryKeys: true,
        fetcher: {
          func: '../../axiosRequest#axiosRequest',
          isReactHook: true,
        },
      },
    },
    'src/gql/infinite-queries/': {
      documents: 'src/gql/infinite-queries/*.graphql',
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '../types.ts',
        folder: 'generated',
      },
      plugins: ['typescript-operations', 'typescript-react-query'],
      config: {
        exposeQueryKeys: true,
        addInfiniteQuery: true,
        fetcher: {
          func: '../../axiosRequest#axiosRequest',
          isReactHook: true,
        },
      },
    },
  },
};
export default config;
