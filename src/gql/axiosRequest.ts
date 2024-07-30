import axios from 'axios';

export const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_BASE_URL });
export const axiosRequest =
  <TData, TVariables>(
    query: string,
    headers?: Record<string, any>,
  ): ((variables?: TVariables) => Promise<TData>) =>
  async (variables?: TVariables) =>
    apiClient
      .post<{ data: TData; errors: any }>(
        '',
        {
          query,
          variables,
        },
        { headers: headers },
      )
      .then(res => {
        if (res.data.errors) {
          throw res.data;
        }
        return res.data.data;
      })
      .catch(error => {
        if (error.message) {
          throw { message: error.message, query, variables };
        } else if (error.errors?.length && error.errors[0]?.message) {
          throw { message: error.errors[0]?.message, query, variables };
        } else {
          throw { message: 'Network Error', query, variables };
        }
      });
