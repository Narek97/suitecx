'use client';
import React, { FC, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { userState } from '@/store/atoms/user.atom';
import { getCookies, removeCookies } from '@/utils/helpers/cookies';
import { LOGIN_ERROR_NAME, TOKEN_NAME } from '@/utils/constants/general';
import { apiClient } from '@/gql/axiosRequest';
import { GetMeQuery, useGetMeQuery } from '@/gql/queries/generated/getMe.generated';
import {
  initiateSocketConnection,
  initiateSocketMapConnection,
} from '@/utils/helpers/socket-connection';
import { Usertype } from '@/utils/ts/types/global-types';
import { generateRandomColor } from '@/utils/helpers/general';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomButton from '@/components/atoms/custom-button/custom-button';

interface IBaseLayout {
  children: React.ReactNode;
}

const BaseLayout: FC<IBaseLayout> = ({ children }) => {
  const token = getCookies(TOKEN_NAME);

  const loginErrorCount = 0;

  const setUser = useSetRecoilState(userState);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMe, setErrorMe] = useState<string>('');

  apiClient.interceptors.request.use(
    function (config: any) {
      if (config.headers) {
        config.headers = {
          ...config.headers,
          'Cache-Control': 'max-age=31536000',
        };
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );

  const redirectToLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_AUTHORIZATION_URL}/?state=null&redirect_uri=${process.env.NEXT_PUBLIC_CALLBACK_URL}&response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}`;
  };

  useGetMeQuery<GetMeQuery, Error>(
    {},
    {
      onSuccess: response => {
        if (!response) {
          removeCookies(TOKEN_NAME);
          redirectToLogin();
        } else {
          localStorage.removeItem(LOGIN_ERROR_NAME);
          initiateSocketConnection(false);
          initiateSocketMapConnection();
          setUser({
            ...response?.getMe,
            color: generateRandomColor(),
          } as Usertype);
          setIsLoading(false);
        }
      },
      onError: error => {
        if (loginErrorCount && +loginErrorCount === 2) {
          setErrorMe(error.message);
          setIsLoading(false);
        } else {
          localStorage.setItem(LOGIN_ERROR_NAME, (+loginErrorCount + 1).toString());
          removeCookies(TOKEN_NAME);
          redirectToLogin();
        }
      },
    },
  );

  const onHandleNavigateToQuestionpro = () => {
    localStorage.removeItem(LOGIN_ERROR_NAME);
    removeCookies(TOKEN_NAME);
    window.location.href = 'https://www.questionpro.com/a/showLogin.do';
  };

  if (errorMe) {
    return (
      <>
        <CustomError error={errorMe} />
        <CustomButton
          startIcon={false}
          onClick={onHandleNavigateToQuestionpro}
          className={'base-layout--go-login-btn'}>
          Go to Questionpro
        </CustomButton>
      </>
    );
  }

  if (isLoading) {
    return <CustomLoader />;
  }

  return <>{children}</>;
};

export default BaseLayout;
