'use client';
import React from 'react';

import './style.scss';
import { useRouter } from 'next/navigation';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import NotFoundIcon from '@/public/base-icons/not-found.svg';
import QuestionProLogoIcon from '@/public/base-icons/qp-logo.svg';

const NotFoundTemplate = () => {
  const router = useRouter();

  return (
    <div className={'page-not-found'}>
      <div className={'page-not-found--header'}>
        <button
          aria-label={'logo'}
          data-testid={'logo-test-id'}
          onClick={() => window.location.replace('https://www.questionpro.com/')}>
          <QuestionProLogoIcon />
        </button>
      </div>
      <div className={'page-not-found--body'}>
        <NotFoundIcon className={'page-not-found--not-found-icon'} />
        <p className={'page-not-found--body--title'}>
          {`Sorry, we couldn't find what you were looking for`}
        </p>
        <p className={'page-not-found--body--sub-title'}>
          <span>Error 404</span> - <span>Page not found</span>
        </p>

        <CustomButton
          startIcon={true}
          variant={'outlined'}
          data-testid={'go-home-test-id'}
          onClick={() => router.push('/workspaces')}>
          Take me back
        </CustomButton>
      </div>

      <div className={'page-not-found--footer'} />
    </div>
  );
};

export default NotFoundTemplate;
