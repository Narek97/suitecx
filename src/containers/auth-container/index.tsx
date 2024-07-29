'use client';
import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomError from '@/components/atoms/custom-error/custome-error';
import { TOKEN_NAME } from '@/utils/constants/general';
import { setCookies } from '@/utils/helpers/cookies';
import { useRouter } from 'next/navigation';

const AuthContainer = ({ code }: { code: string }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  axios
    .get(`${process.env.NEXT_PUBLIC_GENERATE_TOKEN_URL}/?code=${code}`)
    .then((response: AxiosResponse) => {
      setCookies(TOKEN_NAME, response.data.access_token);
      router.push('/workspaces');
    })
    .catch(error => {
      setError(error.message || 'Server Error');
      setIsLoading(false);
    });

  if (isLoading) {
    return <CustomLoader />;
  }
  if (error) {
    return <CustomError error={error} />;
  }

  return <></>;
};

export default AuthContainer;
