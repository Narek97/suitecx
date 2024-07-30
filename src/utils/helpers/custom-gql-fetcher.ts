import { getCookies } from '@/utils/helpers/cookies';
import { TOKEN_NAME } from '../constants/general';

const token = getCookies(TOKEN_NAME);

export const fetchData = async (requestDetails: {
  bodyData?: unknown;
  variables?: unknown;
  endpoint: string;
  method: string;
  configs?: any;
}) => {
  const { bodyData, variables, method, configs } = requestDetails;
  try {
    let body: any = {};
    if (variables) {
      body = {
        query: bodyData,
        variables,
      };
    } else {
      body = bodyData;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      ...configs,
    });
    if (!res.ok) {
      // todo
      // setRecoil(snackbarState, {
      //   title: String(res?.status),
      //   text: res.statusText,
      //   severity: 'error',
      // });
    } else if (configs?.responseType === 'blob') {
      return res.blob();
    }
    return await res.json();
  } catch (error) {
    return error;
  }
};
