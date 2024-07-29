import Cookies from 'js-cookie';

export const setCookies = (name: string, value: string) => {
  return Cookies.set(name, value, {
    path: '/',
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  });
};

export const getCookies = (name: string) => {
  return Cookies.get(name);
};

export const removeCookies = (name: string) => {
  return Cookies.remove(name, {
    expires: 0,
    path: '/',
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  });
};
