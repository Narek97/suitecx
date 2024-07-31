import UserContainer from '@/containers/users-container';
import type { Metadata } from 'next';
import React from 'react';
import './style.scss';

export const metadata: Metadata = {
  title: 'Users',
};

const Page = () => {
  return (
    <div className={'users'}>
      <div className={'base-page-header'}>
        <h3 className={'base-title'}>Users</h3>
      </div>
      <div className={'org-users--main'}>
        <UserContainer />
      </div>
    </div>
  );
};

export default Page;
